import { NextRequest, NextResponse } from "next/server";
import { inquiryRepo } from "@/lib/repo";
import { sendInquiryEmail } from "@/lib/mail";

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
  });

  return NextResponse.json({
    ok: true,
    emailSent: mailResult.sent,
    emailError: mailResult.sent ? undefined : mailResult.error,
  });
}
