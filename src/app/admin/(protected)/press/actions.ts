"use server";

import { revalidatePath } from "next/cache";
import { pressRepo } from "@/lib/repo";

const CATEGORIES = ["media", "broadcast", "paper"];

function val(fd: FormData, k: string): string {
  return String(fd.get(k) ?? "").trim();
}

export async function savePress(formData: FormData) {
  const id = val(formData, "id");
  const categoryRaw = val(formData, "category");
  const category = CATEGORIES.includes(categoryRaw) ? categoryRaw : "media";
  const title = val(formData, "title");
  if (!title) return;

  const input = {
    category,
    title,
    source: val(formData, "source") || null,
    date: val(formData, "date") || null,
    body: val(formData, "body"),
    linkUrl: val(formData, "linkUrl") || null,
    pdfUrl: val(formData, "pdfUrl") || null,
    pdfName: val(formData, "pdfName") || null,
    thumbnailUrl: val(formData, "thumbnailUrl") || null,
  };

  if (id) {
    await pressRepo.update(id, input);
  } else {
    await pressRepo.create({ ...input, sortOrder: 0 });
  }
  revalidatePath("/admin/press");
  revalidatePath("/news/press");
}

export async function deletePress(formData: FormData) {
  const id = val(formData, "id");
  if (!id) return;
  await pressRepo.remove(id);
  revalidatePath("/admin/press");
  revalidatePath("/news/press");
}
