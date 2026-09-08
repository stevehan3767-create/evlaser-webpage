import nodemailer from "nodemailer";
import { settingsRepo } from "./repo";

export const DEFAULT_GENERAL_EMAIL = process.env.MAIL_TO_GENERAL || "info@evlaser.co.kr";
export const DEFAULT_CEO_EMAIL = process.env.MAIL_TO_CEO || "sbhan3763@naver.com";

const CEO_CHANNELS = new Set(["ethics", "praise", "complaint"]);

export async function recipientForChannel(channel: string): Promise<string> {
  if (CEO_CHANNELS.has(channel)) {
    return (await settingsRepo.get("ceoEmail")) || DEFAULT_CEO_EMAIL;
  }
  return (await settingsRepo.get("generalEmail")) || DEFAULT_GENERAL_EMAIL;
}

export function isMailConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    // Nodemailer's own defaults (2 min connection/socket timeouts) leave the
    // request hanging well past Vercel's function limit when SMTP_HOST is
    // wrong or unreachable. These per-phase timeouts help, but a wrong host
    // can still fail slowly enough across phases to blow past Vercel's ~10s
    // Hobby-plan function limit — see withTimeout() below for the hard cap
    // that actually prevents that.
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 5000,
  });
}

// A wrong/unreachable SMTP host can fail slowly enough — across DNS, TCP
// connect, and TLS/greeting phases — to exceed Vercel's function time limit
// before nodemailer's own per-phase timeouts trigger. When that happens,
// Vercel kills the function outright (a raw 504, not JSON), which the
// client's `res.json()` then fails to parse — surfacing as a generic
// "network error" with no indication it was actually an SMTP problem. This
// hard deadline guarantees sendMail always settles in time for the route to
// return a proper JSON response instead.
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`메일 발송 시간 초과 (${ms / 1000}초)`)), ms);
    promise.then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      (e) => {
        clearTimeout(timer);
        reject(e);
      }
    );
  });
}

export const DEFAULT_CAREERS_EMAIL = process.env.MAIL_TO_CAREERS || "info@evlaser.co.kr";

export async function sendJobApplicationEmail(input: {
  to: string;
  jobTitle: string;
  name: string;
  email: string;
  phone?: string;
  message?: string;
  attachments: { filename: string; content: Buffer }[];
}): Promise<{ sent: boolean; error?: string }> {
  if (!isMailConfigured()) {
    return { sent: false, error: "SMTP not configured (SMTP_HOST/SMTP_USER/SMTP_PASS missing)" };
  }

  try {
    await withTimeout(
      getTransporter().sendMail({
      from: process.env.MAIL_FROM || process.env.SMTP_USER,
      to: input.to,
      replyTo: input.email,
      subject: `[EV Laser 채용지원] ${input.jobTitle} - ${input.name}`,
      text: [
        `지원 직무: ${input.jobTitle}`,
        `이름: ${input.name}`,
        `이메일: ${input.email}`,
        input.phone ? `연락처: ${input.phone}` : null,
        "",
        input.message ? "자기소개/메시지:" : null,
        input.message || null,
        "",
        input.attachments.length > 0
          ? `첨부파일: ${input.attachments.map((a) => a.filename).join(", ")}`
          : "첨부파일 없음",
      ]
        .filter((line) => line !== null)
        .join("\n"),
      attachments: input.attachments,
      }),
      7000
    );
    return { sent: true };
  } catch (err) {
    return { sent: false, error: err instanceof Error ? err.message : "unknown error" };
  }
}

export async function sendInquiryEmail(input: {
  channel: string;
  name: string;
  company?: string;
  email: string;
  phone?: string;
  industry?: string;
  message: string;
}): Promise<{ sent: boolean; error?: string }> {
  if (!isMailConfigured()) {
    return { sent: false, error: "SMTP not configured (SMTP_HOST/SMTP_USER/SMTP_PASS missing)" };
  }

  const transporter = getTransporter();
  const to = await recipientForChannel(input.channel);
  const channelLabel: Record<string, string> = {
    general: "일반 문의",
    ethics: "윤리경영 신고",
    praise: "임직원 칭찬",
    complaint: "CEO 직속 고객불만",
  };

  try {
    await withTimeout(
      transporter.sendMail({
        from: process.env.MAIL_FROM || process.env.SMTP_USER,
        to,
        replyTo: input.email,
        subject: `[EV Laser 홈페이지] ${channelLabel[input.channel] ?? "문의"} - ${input.name}`,
        text: [
          `채널: ${channelLabel[input.channel] ?? input.channel}`,
          `이름: ${input.name}`,
          input.company ? `회사명: ${input.company}` : null,
          `이메일: ${input.email}`,
          input.phone ? `연락처: ${input.phone}` : null,
          input.industry ? `관심 산업분야: ${input.industry}` : null,
          "",
          "문의 내용:",
          input.message,
        ]
          .filter(Boolean)
          .join("\n"),
      }),
      7000
    );
    return { sent: true };
  } catch (err) {
    return { sent: false, error: err instanceof Error ? err.message : "unknown error" };
  }
}
