"use server";

import { revalidatePath } from "next/cache";
import { settingsRepo } from "@/lib/repo";

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
