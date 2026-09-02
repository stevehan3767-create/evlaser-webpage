"use server";

import { revalidatePath } from "next/cache";
import { newsRepo } from "@/lib/repo";

export async function createNews(formData: FormData) {
  const tag = String(formData.get("tag") ?? "회사소식");
  const title = String(formData.get("title") ?? "").trim();
  const date = String(formData.get("date") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();

  if (!title || !date) return;

  await newsRepo.create({ tag, title, date, body, published: true });
  revalidatePath("/admin/news");
  revalidatePath("/news");
}

export async function deleteNews(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await newsRepo.remove(id);
  revalidatePath("/admin/news");
  revalidatePath("/news");
}
