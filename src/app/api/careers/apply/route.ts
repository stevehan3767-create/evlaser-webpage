import { NextRequest, NextResponse } from "next/server";
import { jobApplicationRepo, settingsRepo } from "@/lib/repo";
import { sendJobApplicationEmail, DEFAULT_CAREERS_EMAIL } from "@/lib/mail";

const MAX_TOTAL_BYTES = 4 * 1024 * 1024;

export async function POST(req: NextRequest) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const jobTitle = String(form.get("jobTitle") ?? "").trim();
  const name = String(form.get("name") ?? "").trim();
  const email = String(form.get("email") ?? "").trim();
  const phone = String(form.get("phone") ?? "").trim();
  const message = String(form.get("message") ?? "").trim();

  if (!jobTitle || !name || !email) {
    return NextResponse.json({ error: "이름, 이메일, 지원 직무는 필수입니다." }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "이메일 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const files = form.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  const totalBytes = files.reduce((sum, f) => sum + f.size, 0);
  if (totalBytes > MAX_TOTAL_BYTES) {
    return NextResponse.json({ error: "첨부파일 전체 용량은 4MB를 넘을 수 없습니다." }, { status: 400 });
  }

  const attachments = await Promise.all(
    files.map(async (f) => ({ filename: f.name, content: Buffer.from(await f.arrayBuffer()) }))
  );

  const to = (await settingsRepo.get("careersEmail")) || DEFAULT_CAREERS_EMAIL;
  const mailResult = await sendJobApplicationEmail({
    to,
    jobTitle,
    name,
    email,
    phone: phone || undefined,
    message: message || undefined,
    attachments,
  });

  await jobApplicationRepo.create({
    jobTitle,
    name,
    email,
    phone: phone || undefined,
    message: message || undefined,
    fileNames: files.map((f) => f.name).join(", ") || undefined,
    emailSent: mailResult.sent,
  });

  return NextResponse.json({
    ok: true,
    emailSent: mailResult.sent,
    emailError: mailResult.sent ? undefined : mailResult.error,
  });
}
