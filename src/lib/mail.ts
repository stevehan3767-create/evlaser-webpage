import nodemailer from "nodemailer";

const CHANNEL_RECIPIENTS: Record<string, string | undefined> = {
  general: process.env.MAIL_TO_GENERAL || "info@evlaser.co.kr",
  ethics: process.env.MAIL_TO_CEO || "sbhan3763@naver.com",
  praise: process.env.MAIL_TO_CEO || "sbhan3763@naver.com",
  complaint: process.env.MAIL_TO_CEO || "sbhan3763@naver.com",
};

export function recipientForChannel(channel: string): string {
  return CHANNEL_RECIPIENTS[channel] ?? CHANNEL_RECIPIENTS.general!;
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
    await getTransporter().sendMail({
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
    });
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
  const to = recipientForChannel(input.channel);
  const channelLabel: Record<string, string> = {
    general: "일반 문의",
    ethics: "윤리경영 신고",
    praise: "임직원 칭찬",
    complaint: "CEO 직속 고객불만",
  };

  try {
    await transporter.sendMail({
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
    });
    return { sent: true };
  } catch (err) {
    return { sent: false, error: err instanceof Error ? err.message : "unknown error" };
  }
}
