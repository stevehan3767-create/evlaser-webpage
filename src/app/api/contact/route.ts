import { NextRequest, NextResponse } from "next/server";
import { inquiryRepo, supportPostRepo } from "@/lib/repo";
import { sendInquiryEmail } from "@/lib/mail";
import { maskName, deriveInquiryTitle } from "@/lib/mask";

// sendInquiryEmail is internally capped at 15s, under this — set explicitly
// so a misconfigured SMTP host can never make Vercel kill the function with
// a raw (non-JSON) 504 before our own error handling runs.
export const maxDuration = 20;

const VALID_CHANNELS = new Set(["general", "ethics", "praise", "complaint"]);

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const company = typeof body.company === "string" ? body.company.trim() : undefined;
  const phone = typeof body.phone === "string" ? body.phone.trim() : undefined;
  const industry = typeof body.industry === "string" ? body.industry.trim() : undefined;
  const channelRaw = typeof body.channel === "string" ? body.channel : "general";
  const channel = VALID_CHANNELS.has(channelRaw) ? channelRaw : "general";

  if (!name || !email || !message) {
    return NextResponse.json({ error: "이름, 이메일, 문의 내용은 필수입니다." }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "이메일 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const mailResult = await sendInquiryEmail({ channel, name, company, email, phone, industry, message });

  await inquiryRepo.create({
    channel,
    name,
    company,
    email,
    phone,
    industry,
    message,
    emailSent: mailResult.sent,
    emailError: mailResult.sent ? undefined : mailResult.error,
  });

  // 일반 문의는 공개 게시판(고객지원 문의접수) 맨 위에 자동 등록(이름 마스킹, 본문 비공개).
  // 민감한 CEO 직속 채널은 공개 목록에 올리지 않는다. 실패해도 접수 자체는 성공 처리.
  if (channel === "general") {
    try {
      const now = new Date();
      const p = (n: number) => String(n).padStart(2, "0");
      await supportPostRepo.addFromInquiry({
        title: deriveInquiryTitle(message, industry),
        author: maskName(name),
        postedOn: `${now.getFullYear()}.${p(now.getMonth() + 1)}.${p(now.getDate())}`,
      });
    } catch {
      /* 공개 게시판 등록 실패는 접수 결과에 영향 없음 */
    }
  }

  return NextResponse.json({
    ok: true,
    emailSent: mailResult.sent,
    emailError: mailResult.sent ? undefined : mailResult.error,
  });
}
