"use server";

import { createSmtpTransporter, getSmtpConfig } from "./transporter";

type AppointmentEmailBase = {
  to: string;
  recipientName?: string | null;
  appointmentDate: Date;
  durationMinutes: number;
  specialistName: string;
  seniorName: string;
  locationType: "remote" | "in-person";
  address?: string | null;
  meetingLink?: string | null;
  totalPrice?: number | null;
  issueDescription?: string | null;
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(date);
}

function buildLocationDetails({
  locationType,
  address,
  meetingLink,
}: {
  locationType: "remote" | "in-person";
  address?: string | null;
  meetingLink?: string | null;
}) {
  if (locationType === "remote") {
    if (meetingLink) {
      return `Remote session · Join link: ${meetingLink}`;
    }
    return "Remote session · A secure meeting link will be shared before start time.";
  }

  return address
    ? `In-person session · Location: ${address}`
    : "In-person session · Your specialist will confirm the final address.";
}

function plainLocationDetails(params: {
  locationType: "remote" | "in-person";
  address?: string | null;
  meetingLink?: string | null;
}) {
  if (params.locationType === "remote") {
    if (params.meetingLink) {
      return `Remote session\nJoin link: ${params.meetingLink}`;
    }
    return "Remote session (meeting link will be provided separately)";
  }

  return params.address
    ? `In-person session at ${params.address}`
    : "In-person session (address will be confirmed)";
}

async function sendEmail(subject: string, html: string, text: string, to: string) {
  const { from } = getSmtpConfig();
  const transporter = createSmtpTransporter();
  await transporter.sendMail({
    from,
    to,
    subject,
    html,
    text,
  });
}

export async function sendAppointmentConfirmationEmail(params: AppointmentEmailBase) {
  const {
    to,
    recipientName,
    appointmentDate,
    durationMinutes,
    specialistName,
    seniorName,
    locationType,
    address,
    meetingLink,
    totalPrice,
    issueDescription,
  } = params;

  const friendlyDate = formatDate(appointmentDate);
  const durationLabel = `${durationMinutes} minute${durationMinutes === 60 ? "" : "s"}`;
  const locationDetails = buildLocationDetails({ locationType, address, meetingLink });

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
      <h2 style="color: #0c4a6e; margin-bottom: 16px;">Appointment confirmed</h2>
      <p>Hi ${recipientName || "there"},</p>
      <p>Your appointment has been scheduled. Here are the details:</p>
      <div style="margin: 20px 0; padding: 16px; border: 1px solid #cbd5f5; border-radius: 8px;">
        <p style="margin: 0;"><strong>Date:</strong> ${friendlyDate}</p>
        <p style="margin: 0;"><strong>Duration:</strong> ${durationLabel}</p>
        <p style="margin: 0;"><strong>Specialist:</strong> ${specialistName}</p>
        <p style="margin: 0;"><strong>For:</strong> ${seniorName}</p>
        <p style="margin: 0;"><strong>Location:</strong> ${locationDetails}</p>
        ${totalPrice ? `<p style="margin: 0;"><strong>Total price:</strong> $${totalPrice.toFixed(2)}</p>` : ""}
      </div>
      ${
        issueDescription
          ? `<p style="margin-bottom: 16px;"><strong>Issue summary:</strong><br/>${issueDescription}</p>`
          : ""
      }
      <p>Need to make a change? Sign in to HITS to update or message your specialist.</p>
      <p style="margin-top: 32px;">— The HITS Team</p>
    </div>
  `;

  const textSections = [
    `Hi ${recipientName || "there"},`,
    "",
    "Your appointment has been scheduled. Details:",
    `• Date: ${friendlyDate}`,
    `• Duration: ${durationLabel}`,
    `• Specialist: ${specialistName}`,
    `• For: ${seniorName}`,
    `• Location: ${plainLocationDetails({ locationType, address, meetingLink })}`,
  ];

  if (totalPrice) {
    textSections.push(`• Total price: $${totalPrice.toFixed(2)}`);
  }
  if (issueDescription) {
    textSections.push("", "Issue summary:", issueDescription);
  }

  textSections.push("", "Need to make a change? Sign in to HITS.", "", "— The HITS Team");

  await sendEmail("Your HITS appointment is confirmed", html, textSections.join("\n"), to);
}

export async function sendAppointmentReminderEmail(
  params: AppointmentEmailBase & { hoursBefore: number }
) {
  const {
    to,
    recipientName,
    appointmentDate,
    durationMinutes,
    specialistName,
    seniorName,
    locationType,
    address,
    meetingLink,
    hoursBefore,
  } = params;

  const friendlyDate = formatDate(appointmentDate);
  const durationLabel = `${durationMinutes} minute${durationMinutes === 60 ? "" : "s"}`;
  const locationDetails = buildLocationDetails({ locationType, address, meetingLink });

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
      <h2 style="color: #0c4a6e; margin-bottom: 16px;">Upcoming appointment reminder</h2>
      <p>Hi ${recipientName || "there"},</p>
      <p>Your session is coming up in about ${hoursBefore} hours. Here are the details:</p>
      <div style="margin: 20px 0; padding: 16px; border: 1px solid #cbd5f5; border-radius: 8px;">
        <p style="margin: 0;"><strong>Date:</strong> ${friendlyDate}</p>
        <p style="margin: 0;"><strong>Duration:</strong> ${durationLabel}</p>
        <p style="margin: 0;"><strong>Specialist:</strong> ${specialistName}</p>
        <p style="margin: 0;"><strong>For:</strong> ${seniorName}</p>
        <p style="margin: 0;"><strong>Location:</strong> ${locationDetails}</p>
      </div>
      <p>Please sign in if you need to reschedule or send a message before the session.</p>
      <p style="margin-top: 32px;">— The HITS Team</p>
    </div>
  `;

  const text = [
    `Hi ${recipientName || "there"},`,
    "",
    `Reminder: your appointment starts in about ${hoursBefore} hours.`,
    `Date: ${friendlyDate}`,
    `Duration: ${durationLabel}`,
    `Specialist: ${specialistName}`,
    `For: ${seniorName}`,
    `Location: ${plainLocationDetails({ locationType, address, meetingLink })}`,
    "",
    "Need to reschedule? Sign in to HITS.",
    "",
    "— The HITS Team",
  ].join("\n");

  await sendEmail("Reminder: upcoming HITS appointment", html, text, to);
}


