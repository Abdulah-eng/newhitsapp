"use server";

import { createSmtpTransporter, getSmtpConfig } from "./transporter";
import type { UserRole } from "@/types";

type SendWelcomeEmailParams = {
  to: string;
  fullName?: string | null;
  role?: UserRole | null;
};

function buildWelcomeCopy(role?: UserRole | null) {
  if (role === "specialist") {
    return {
      headline: "Welcome to the HITS Specialist Network",
      intro:
        "We're excited to have you onboard. Seniors and caregivers rely on HITS specialists like you for trusted, patient technology support.",
      highlights: [
        "Complete your profile so seniors can learn about your specialties",
        "Set your availability so caregivers can book time with you",
        "Watch for booking notifications—confirm quickly to secure sessions",
      ],
    };
  }

  return {
    headline: "Welcome to HITS",
    intro:
      "Thanks for creating your account! You're just a few clicks away from getting personalized technology assistance from vetted specialists.",
    highlights: [
      "Browse verified specialists who match your needs",
      "Book remote or in-home visits when it works for you",
      "Use secure messaging to stay in touch with your specialist",
    ],
  };
}

export async function sendWelcomeEmail({ to, fullName, role }: SendWelcomeEmailParams) {
  const { from } = getSmtpConfig();
  const transporter = createSmtpTransporter();
  const greetingName = fullName?.trim() || "there";
  const copy = buildWelcomeCopy(role);

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
      <h2 style="color: #0c4a6e; margin-bottom: 16px;">${copy.headline}</h2>
      <p>Hi ${greetingName},</p>
      <p>${copy.intro}</p>
      <ul style="padding-left: 18px; margin: 18px 0;">
        ${copy.highlights
          .map(
            (item) =>
              `<li style="margin-bottom: 10px; color: #0f172a;">${item}</li>`
          )
          .join("")}
      </ul>
      <p style="margin: 24px 0;">Whenever you're ready, sign in to explore everything your new account can do.</p>
      <p style="margin-top: 32px;">— The HITS Team</p>
    </div>
  `;

  const text = [
    `Hi ${greetingName},`,
    "",
    copy.intro,
    "",
    "Here's how to get started:",
    ...copy.highlights.map((item, index) => `${index + 1}. ${item}`),
    "",
    "Sign in anytime to continue.",
    "",
    "— The HITS Team",
  ].join("\n");

  await transporter.sendMail({
    from,
    to,
    subject: "Welcome to HITS",
    html,
    text,
  });
}


