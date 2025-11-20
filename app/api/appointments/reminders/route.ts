"use server";

import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { sendAppointmentReminderEmail } from "@/lib/email/sendAppointmentEmails";

const REMINDER_WINDOW_HOURS = 24;

type ReminderAppointment = {
  id: string;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  location_type: "remote" | "in-person";
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip_code?: string | null;
  meeting_link?: string | null;
  reminder_email_sent_at?: string | null;
  senior: { full_name?: string | null; email: string };
  specialist: { full_name?: string | null; email: string };
};

function buildAddress(record: ReminderAppointment) {
  if (record.location_type !== "in-person") {
    return null;
  }

  const parts = [record.address, record.city, record.state, record.zip_code].filter(Boolean);
  return parts.length ? parts.join(", ") : null;
}

export async function POST(request: NextRequest) {
  try {
    const expectedSecret = process.env.APPOINTMENT_REMINDER_SECRET;
    if (!expectedSecret) {
      console.error("APPOINTMENT_REMINDER_SECRET is not configured.");
      return NextResponse.json(
        { error: "Reminder secret not configured" },
        { status: 500 }
      );
    }

    const providedSecret = request.headers.get("x-cron-secret");
    if (!providedSecret || providedSecret !== expectedSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createSupabaseServiceRoleClient();
    const now = new Date();
    const windowEnd = new Date(now.getTime() + REMINDER_WINDOW_HOURS * 60 * 60 * 1000);

    const { data, error } = await supabase
      .from("appointments")
      .select(
        `
        id,
        scheduled_at,
        duration_minutes,
        status,
        location_type,
        address,
        city,
        state,
        zip_code,
        meeting_link,
        reminder_email_sent_at,
        senior:senior_id (full_name, email),
        specialist:specialist_id (full_name, email)
      `
      )
      .in("status", ["pending", "confirmed"])
      .is("reminder_email_sent_at", null)
      .gte("scheduled_at", now.toISOString())
      .lte("scheduled_at", windowEnd.toISOString());

    if (error) {
      console.error("Failed to query appointments for reminders:", error);
      return NextResponse.json({ error: "Failed to query appointments" }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ success: true, sent: 0 });
    }

    const appointments = data.map((record) => ({
      ...record,
      senior: Array.isArray(record.senior) ? record.senior[0] : record.senior,
      specialist: Array.isArray(record.specialist) ? record.specialist[0] : record.specialist,
    })) as ReminderAppointment[];

    let sentCount = 0;

    for (const appointment of appointments) {
      const appointmentDate = new Date(appointment.scheduled_at);
      const address = buildAddress(appointment);
      const seniorName = appointment.senior.full_name || "you";
      const specialistName = appointment.specialist.full_name || "your HITS specialist";

      try {
        await Promise.all([
          sendAppointmentReminderEmail({
            to: appointment.senior.email,
            recipientName: appointment.senior.full_name,
            appointmentDate,
            durationMinutes: appointment.duration_minutes,
            specialistName,
            seniorName,
            locationType: appointment.location_type,
            address,
            meetingLink: appointment.meeting_link ?? undefined,
            hoursBefore: REMINDER_WINDOW_HOURS,
          }),
          sendAppointmentReminderEmail({
            to: appointment.specialist.email,
            recipientName: appointment.specialist.full_name,
            appointmentDate,
            durationMinutes: appointment.duration_minutes,
            specialistName,
            seniorName,
            locationType: appointment.location_type,
            address,
            meetingLink: appointment.meeting_link ?? undefined,
            hoursBefore: REMINDER_WINDOW_HOURS,
          }),
        ]);

        await supabase
          .from("appointments")
          .update({ reminder_email_sent_at: new Date().toISOString() })
          .eq("id", appointment.id);

        sentCount += 1;
      } catch (emailError) {
        console.error(`Failed to send reminder for appointment ${appointment.id}:`, emailError);
      }
    }

    return NextResponse.json({ success: true, sent: sentCount });
  } catch (error) {
    console.error("Failed to send appointment reminders:", error);
    return NextResponse.json({ error: "Failed to send appointment reminders" }, { status: 500 });
  }
}


