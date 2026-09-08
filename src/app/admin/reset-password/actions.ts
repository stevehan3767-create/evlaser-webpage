"use server";

import { redirect } from "next/navigation";
import { isRecoveryConfigured, checkRecoveryKey, setPassword } from "@/lib/auth";

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
