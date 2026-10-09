"use server";

import { revalidatePath } from "next/cache";
import { resourceRepo } from "@/lib/repo";

export async function saveResource(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  const category = String(formData.get("category") ?? "doc");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();
  const thumbnailUrl = String(formData.get("thumbnailUrl") ?? "").trim();

  if (!title || !description) return;

  if (id) {
    await resourceRepo.update(id, { category, title, description, url: url || undefined, thumbnailUrl: thumbnailUrl || undefined });
  } else {
    await resourceRepo.create({ category, title, description, url: url || undefined, thumbnailUrl: thumbnailUrl || undefined });
  }
  revalidatePath("/admin/resources");
  revalidatePath("/resources");
}

export async function deleteResource(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await resourceRepo.remove(id);
  revalidatePath("/admin/resources");
  revalidatePath("/resources");
}
