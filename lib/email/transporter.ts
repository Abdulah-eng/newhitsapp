import nodemailer from "nodemailer";

export type SmtpConfig = {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
};

function getEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function getSmtpConfig(): SmtpConfig {
  const host = getEnv("SMTP_HOST");
  const port = Number(getEnv("SMTP_PORT"));
  const user = getEnv("SMTP_USER");
  const pass = getEnv("SMTP_PASSWORD");
  const from = getEnv("SMTP_FROM");

  return {
    host,
    port,
    user,
    pass,
    from,
  };
}

export function createSmtpTransporter() {
  const { host, port, user, pass } = getSmtpConfig();

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });
}


