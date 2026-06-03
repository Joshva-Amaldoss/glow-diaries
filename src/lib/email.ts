import nodemailer from "nodemailer";

type SendOptions = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

function smtpConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER);
}

function getTransport() {
  const port = Number(process.env.SMTP_PORT ?? 587);
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendEmail({ to, subject, text, html }: SendOptions) {
  const from = process.env.EMAIL_FROM ?? "Glow Diaries <noreply@Glow Diaries.com>";

  if (!smtpConfigured()) {
    console.log("[Glow Diaries email — SMTP not configured, logging only]");
    console.log({ to, subject, text });
    return { ok: true, mode: "console" as const };
  }

  const transport = getTransport();
  await transport.sendMail({
    from,
    to,
    subject,
    text,
    html: html ?? text.replace(/\n/g, "<br>"),
  });
  return { ok: true, mode: "smtp" as const };
}

export function adminInbox(): string {
  return process.env.ADMIN_EMAIL ?? "support@Glow Diaries.com";
}

export async function notifyWelcome(email: string, name?: string) {
  await sendEmail({
    to: email,
    subject: "Welcome to Glow Diaries Care",
    text: `Hello${name ? ` ${name}` : ""},\n\nYour account is ready. Complete your profile and run a skin analysis to get personalized product recommendations.\n\n— Glow Diaries Healthcare Skincare`,
  });
}

export async function notifyAssessment(
  email: string,
  name: string,
  faceType: string,
  products: string[]
) {
  await sendEmail({
    to: email,
    subject: "Your Glow Diaries skin analysis results",
    text: `Hi ${name},\n\nYour latest analysis identified: ${faceType}.\n\nRecommended products:\n${products.map((p) => `• ${p}`).join("\n")}\n\nView full details by signing in to your dashboard.\n\n— Glow Diaries`,
  });
}

export async function notifyWeekly(
  email: string,
  name: string,
  weekNumber: number,
  skinScore: number,
  comparisonNotes?: string | null
) {
  await sendEmail({
    to: email,
    subject: `Glow Diaries weekly report — Week ${weekNumber}`,
    text: `Hi ${name},\n\nWeek ${weekNumber} is saved. Overall skin score: ${skinScore}/100.\n${comparisonNotes ? `\n${comparisonNotes}\n` : ""}\nKeep your routine consistent for best results.\n\n— Glow Diaries`,
  });
}

export async function notifyContactAdmin(data: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}) {
  await sendEmail({
    to: adminInbox(),
    subject: `[Contact] ${data.subject}`,
    text: `From: ${data.name} <${data.email}>\nPhone: ${data.phone ?? "—"}\n\n${data.message}`,
  });
}

export async function notifyContactConfirmation(email: string, name: string) {
  await sendEmail({
    to: email,
    subject: "We received your message — Glow Diaries",
    text: `Hi ${name},\n\nThank you for contacting Glow Diaries. Our team will reply within 1–2 business days.\n\n— Glow Diaries Support`,
  });
}
