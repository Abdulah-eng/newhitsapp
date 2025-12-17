"use server";

import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/utils/auth";
import { sendAppointmentConfirmationEmail } from "@/lib/email/sendAppointmentEmails";

type AppointmentRecord = {
  id: string;
  senior_id: string;
  specialist_id: string;
  scheduled_at: string;
  duration_minutes: number;
  location_type: "remote" | "in-person";
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip_code?: string | null;
  meeting_link?: string | null;
  total_price?: number | null;
  issue_description?: string | null;
  confirmation_email_sent_at?: string | null;
  senior: {
    full_name?: string | null;
    email: string;
  };
  specialist: {
    full_name?: string | null;
    email: string;
  };
};

function buildAddress(record: AppointmentRecord) {
  if (record.location_type !== "in-person") {
    return null;
  }

  const parts = [record.address, record.city, record.state, record.zip_code].filter(Boolean);
  return parts.length ? parts.join(", ") : null;
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    console.log(`[Send Confirmation] Processing request for appointment ID: ${id}`);
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createSupabaseServiceRoleClient();
    const { data, error } = await supabase
      .from("appointments")
      .select(
        `
        id,
        senior_id,
        specialist_id,
        scheduled_at,
        duration_minutes,
        location_type,
        address,
        city,
        state,
        zip_code,
        meeting_link,
        total_price,
        issue_description,
        confirmation_email_sent_at,
        senior:senior_id (full_name, email),
        specialist:specialist_id (full_name, email)
      `
      )
      .eq("id", id)
      .single();

    console.log(`[Send Confirmation] Database query result:`, { data: !!data, error });

    if (error || !data) {
      console.error(`[Send Confirmation] Appointment not found for ID ${id}:`, error);
      return NextResponse.json({ error: "Appointment not found", details: error?.message }, { status: 404 });
    }

    const appointment = {
      ...data,
      senior: Array.isArray(data.senior) ? data.senior[0] : data.senior,
      specialist: Array.isArray(data.specialist) ? data.specialist[0] : data.specialist,
    } as AppointmentRecord;
    const isSenior = appointment.senior_id === user.id;
    const isSpecialist = appointment.specialist_id === user.id;
    const isAdmin = user.role === "admin";

    if (!isSenior && !isSpecialist && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const forceSend = request.nextUrl.searchParams.get("force") === "true";
    if (appointment.confirmation_email_sent_at && !forceSend) {
      return NextResponse.json({ success: true, skipped: true });
    }

    const appointmentDate = new Date(appointment.scheduled_at);
    const address = buildAddress(appointment);
    const seniorName = appointment.senior.full_name || "you";
    const specialistName = appointment.specialist.full_name || "your HITS specialist";

    await Promise.all([
      sendAppointmentConfirmationEmail({
        to: appointment.senior.email,
        recipientName: appointment.senior.full_name,
        appointmentDate,
        durationMinutes: appointment.duration_minutes,
        specialistName,
        seniorName,
        locationType: appointment.location_type,
        address,
        meetingLink: appointment.meeting_link ?? undefined,
        totalPrice: appointment.total_price ?? undefined,
        issueDescription: appointment.issue_description ?? undefined,
      }),
      sendAppointmentConfirmationEmail({
        to: appointment.specialist.email,
        recipientName: appointment.specialist.full_name,
        appointmentDate,
        durationMinutes: appointment.duration_minutes,
        specialistName,
        seniorName,
        locationType: appointment.location_type,
        address,
        meetingLink: appointment.meeting_link ?? undefined,
        totalPrice: appointment.total_price ?? undefined,
        issueDescription: appointment.issue_description ?? undefined,
      }),
    ]);

    await supabase
      .from("appointments")
      .update({ confirmation_email_sent_at: new Date().toISOString() })
      .eq("id", appointment.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to send appointment confirmation email:", error);
    return NextResponse.json(
      { error: "Failed to send appointment confirmation email" },
      { status: 500 }
    );
  }
}


