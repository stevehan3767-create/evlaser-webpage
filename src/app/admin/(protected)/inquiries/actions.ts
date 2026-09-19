"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { settingsRepo } from "@/lib/repo";
import { verifySmtp, sendTestEmail } from "@/lib/mail";

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function saveInquiryEmails(formData: FormData) {
  const generalEmail = String(formData.get("generalEmail") ?? "").trim();
  const ceoEmail = String(formData.get("ceoEmail") ?? "").trim();

  if (generalEmail && isEmail(generalEmail)) await settingsRepo.set("generalEmail", generalEmail);
  if (ceoEmail && isEmail(ceoEmail)) await settingsRepo.set("ceoEmail", ceoEmail);

  revalidatePath("/admin/inquiries");
}

// SMTP 접속을 확인하고, 수신 주소가 입력되면 테스트 메일까지 보낸다.
// 결과와 사용 중인 설정 요약을 쿼리스트링으로 돌려줘 관리자가 바로 진단할 수 있다.
export async function testSmtp(formData: FormData) {
  const to = String(formData.get("to") ?? "").trim();
  const v = await verifySmtp();
  const cfg = encodeURIComponent(v.config);
  if (!v.ok) {
    redirect(`/admin/inquiries?smtp=fail&detail=${encodeURIComponent(v.error ?? "")}&cfg=${cfg}`);
  }
  if (to && isEmail(to)) {
    const s = await sendTestEmail(to);
    if (!s.sent) {
      redirect(`/admin/inquiries?smtp=sendfail&detail=${encodeURIComponent(s.error ?? "")}&cfg=${cfg}`);
    }
    redirect(`/admin/inquiries?smtp=sent&cfg=${cfg}`);
  }
  redirect(`/admin/inquiries?smtp=ok&cfg=${cfg}`);
}
