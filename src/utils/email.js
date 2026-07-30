import nodemailer from 'nodemailer';
import { logger } from './logger.js';

export async function sendMail({ to, subject, text }) {
  if (!process.env.SMTP_HOST) {
    logger.warn('SMTP not configured; email suppressed', { to, subject });
    return;
  }
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined
  });
  await transporter.sendMail({ from: process.env.SMTP_FROM, to, subject, text });
}
