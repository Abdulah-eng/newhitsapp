"use server";

import nodemailer from "nodemailer";

type SendNewMessageEmailParams = {
  to: string;
  recipientName?: string | null;
  senderName?: string | null;
  conversationUrl: string;
};

function getSmtpConfig() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASSWORD || !SMTP_FROM) {
    throw new Error(
      "SMTP configuration is missing. Please set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, and SMTP_FROM environment variables."
    );
  }

  return {
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    user: SMTP_USER,
    pass: SMTP_PASSWORD,
    from: SMTP_FROM,
  };
}

export async function sendNewMessageEmail({
  to,
  recipientName,
  senderName,
  conversationUrl,
}: SendNewMessageEmailParams) {
  const { host, port, user, pass, from } = getSmtpConfig();

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });

  const displayRecipient = recipientName || "there";
  const displaySender = senderName || "a member of the HITS community";

  const subject = "You have a new message on HITS";
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #0f172a;">
      <h2 style="color: #0c4a6e; margin-bottom: 16px;">You have a new message</h2>
      <p>Hi ${displayRecipient},</p>
      <p>${displaySender} just sent you a new message on the HITS platform.</p>
      <p style="margin: 24px 0;">
        <a href="${conversationUrl}" style="background-color:#0c4a6e;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;">
          View message
        </a>
      </p>
      <p style="color:#475569;">For security, the message body isn’t included here. Please sign in to view and reply.</p>
      <p style="margin-top: 32px;">— The HITS team</p>
    </div>
  `;

  const text = `Hi ${displayRecipient},

${displaySender} sent you a new message on the HITS platform.

View it here: ${conversationUrl}

— The HITS team`;

  await transporter.sendMail({
    from,
    to,
    subject,
    html,
    text,
  });
}


