"use server";

import { revalidatePath } from "next/cache";
import { settingsRepo } from "@/lib/repo";

export async function saveCareersEmail(formData: FormData) {
  const email = String(formData.get("careersEmail") ?? "").trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;

  await settingsRepo.set("careersEmail", email);
  revalidatePath("/admin/careers");
}
