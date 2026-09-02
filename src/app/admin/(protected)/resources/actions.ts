"use server";

import { revalidatePath } from "next/cache";
import { resourceRepo } from "@/lib/repo";

export async function createResource(formData: FormData) {
  const category = String(formData.get("category") ?? "doc");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();

  if (!title || !description) return;

  await resourceRepo.create({ category, title, description, url: url || undefined });
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
