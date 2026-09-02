"use server";

import { revalidatePath } from "next/cache";
import { faqRepo } from "@/lib/repo";

export async function createFaq(formData: FormData) {
  const question = String(formData.get("question") ?? "").trim();
  const answer = String(formData.get("answer") ?? "").trim();
  if (!question || !answer) return;

  await faqRepo.create({ question, answer });
  revalidatePath("/admin/faqs");
  revalidatePath("/support");
}

export async function deleteFaq(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await faqRepo.remove(id);
  revalidatePath("/admin/faqs");
  revalidatePath("/support");
}
