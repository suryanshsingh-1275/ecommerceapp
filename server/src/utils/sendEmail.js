import nodemailer from 'nodemailer';

export default async function sendEmail({ to, subject, text }) {
  if (!process.env.SMTP_HOST) {
    console.log(`\n[EMAIL to ${to}] ${subject}\n${text}\n`);
    return;
  }
  const t = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  await t.sendMail({ from: process.env.MAIL_FROM, to, subject, text });
}