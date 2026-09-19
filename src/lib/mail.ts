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

// 포트에 따라 TLS 방식을 직접 결정한다. 465는 암시적 TLS(secure:true),
// 587/25는 STARTTLS(secure:false + requireTLS:true). SMTP_SECURE 값이 포트와
// 어긋나게 설정돼 있으면 (예: 587 + secure:true) 연결이 응답 없이 멈춰
// 타임아웃으로 끝나는데, 이것이 "메일 발송 시간 초과"의 가장 흔한 원인이라
// 환경변수 대신 포트에서 안전하게 유도한다.
function smtpConfig(): { port: number; secure: boolean } {
  const port = Number(process.env.SMTP_PORT || 587);
  return { port, secure: port === 465 };
}

function getTransporter() {
  const { port, secure } = smtpConfig();
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure,
    requireTLS: !secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    // Nodemailer's own defaults (2 min connection/socket timeouts) leave the
    // request hanging well past the platform's function limit. The API routes
    // that send mail allow up to 20s (maxDuration), so give each phase a
    // realistic 12s — Mailplug over Vercel's network can need well over the
    // old 5s — and rely on withTimeout() below as the hard overall cap.
    connectionTimeout: 12000,
    greetingTimeout: 12000,
    socketTimeout: 12000,
  });
}

// SMTP 설정이 실제로 접속·인증되는지 확인한다. 관리자 화면의 진단 버튼에서
// 사용하며, 현재 사용 중인 host/port/secure 요약도 함께 돌려준다.
export async function verifySmtp(): Promise<{ ok: boolean; error?: string; config: string }> {
  const { port, secure } = smtpConfig();
  const config = `host=${process.env.SMTP_HOST || "(미설정)"}, port=${port}, secure=${secure}, user=${process.env.SMTP_USER ? "설정됨" : "(미설정)"}`;
  if (!isMailConfigured()) {
    return { ok: false, error: "SMTP_HOST/SMTP_USER/SMTP_PASS 중 일부가 설정되지 않았습니다.", config };
  }
  try {
    await withTimeout(getTransporter().verify(), 15000);
    return { ok: true, config };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "unknown error", config };
  }
}

export async function sendTestEmail(to: string): Promise<{ sent: boolean; error?: string }> {
  if (!isMailConfigured()) {
    return { sent: false, error: "SMTP not configured (SMTP_HOST/SMTP_USER/SMTP_PASS missing)" };
  }
  try {
    await withTimeout(
      getTransporter().sendMail({
        from: process.env.MAIL_FROM || process.env.SMTP_USER,
        to,
        subject: "[EV Laser] SMTP 테스트 메일",
        text: "이 메일이 도착했다면 홈페이지의 SMTP 발송이 정상 작동하는 것입니다.",
      }),
      15000
    );
    return { sent: true };
  } catch (err) {
    return { sent: false, error: err instanceof Error ? err.message : "unknown error" };
  }
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
      15000
    );
    return { sent: true };
  } catch (err) {
    return { sent: false, error: err instanceof Error ? err.message : "unknown error" };
  }
}

export async function sendPasswordResetEmail(input: { to: string; code: string }): Promise<{ sent: boolean; error?: string }> {
  if (!isMailConfigured()) {
    return { sent: false, error: "SMTP not configured (SMTP_HOST/SMTP_USER/SMTP_PASS missing)" };
  }
  try {
    await withTimeout(
      getTransporter().sendMail({
        from: process.env.MAIL_FROM || process.env.SMTP_USER,
        to: input.to,
        subject: "[EV Laser 관리자] 비밀번호 재설정 인증 코드",
        text: [
          "관리자 로그인 비밀번호 재설정을 위한 인증 코드입니다.",
          "",
          `인증 코드: ${input.code}`,
          "",
          "이 코드는 10분간 유효합니다.",
          "본인이 요청하지 않았다면 이 메일을 무시하세요.",
        ].join("\n"),
      }),
      15000
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
      15000
    );
    return { sent: true };
  } catch (err) {
    return { sent: false, error: err instanceof Error ? err.message : "unknown error" };
  }
}
