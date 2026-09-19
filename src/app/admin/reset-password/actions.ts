"use server";

import { redirect } from "next/navigation";
import {
  isRecoveryConfigured,
  checkRecoveryKey,
  setPassword,
  recoveryEmail,
  createResetCode,
  checkResetCode,
  clearResetCode,
} from "@/lib/auth";
import { isMailConfigured, sendPasswordResetEmail } from "@/lib/mail";

export async function resetPassword(formData: FormData) {
  const recoveryKey = String(formData.get("recoveryKey") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!isRecoveryConfigured()) {
    redirect("/admin/reset-password?error=not_configured");
  }
  if (!checkRecoveryKey(recoveryKey)) {
    redirect("/admin/reset-password?error=invalid_key");
  }
  if (newPassword.trim().length < 4) {
    redirect("/admin/reset-password?error=too_short");
  }
  if (newPassword.trim() !== confirmPassword.trim()) {
    redirect("/admin/reset-password?error=mismatch");
  }

  await setPassword(newPassword);
  redirect("/admin/login?reset=done");
}

// 등록된 관리자 메일로 6자리 인증 코드를 보낸다. 복구 키를 모를 때의 경로.
export async function requestResetCode() {
  if (!isMailConfigured()) {
    redirect("/admin/reset-password?error=mail_not_configured");
  }
  const to = recoveryEmail();
  if (!to) {
    redirect("/admin/reset-password?error=no_recovery_email");
  }
  const code = await createResetCode();
  const { sent, error } = await sendPasswordResetEmail({ to, code });
  if (!sent) {
    await clearResetCode();
    redirect(`/admin/reset-password?error=send_failed&detail=${encodeURIComponent(error ?? "")}`);
  }
  redirect("/admin/reset-password?sent=1");
}

// 메일로 받은 인증 코드로 비밀번호를 새로 설정한다.
export async function resetPasswordByCode(formData: FormData) {
  const code = String(formData.get("code") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!(await checkResetCode(code))) {
    redirect("/admin/reset-password?error=invalid_code");
  }
  if (newPassword.trim().length < 4) {
    redirect("/admin/reset-password?error=too_short");
  }
  if (newPassword.trim() !== confirmPassword.trim()) {
    redirect("/admin/reset-password?error=mismatch");
  }

  await setPassword(newPassword);
  await clearResetCode();
  redirect("/admin/login?reset=done");
}
