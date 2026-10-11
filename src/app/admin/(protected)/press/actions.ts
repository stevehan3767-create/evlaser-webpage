"use server";

import { revalidatePath } from "next/cache";
import { pressRepo, pressImageRepo } from "@/lib/repo";

const CATEGORIES = ["media", "broadcast", "paper"];
const MAX_IMAGES = 10;

interface StagedImage {
  url: string;
  caption?: string;
  content?: string;
}

function parseStagedImages(raw: string): StagedImage[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((x): x is StagedImage => Boolean(x) && typeof x.url === "string" && x.url.trim() !== "")
      .map((x) => ({ url: x.url.trim(), caption: x.caption ?? "", content: x.content ?? "" }));
  } catch {
    return [];
  }
}

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

  const pressId = id || (await pressRepo.create({ ...input, sortOrder: 0 }));
  if (id) {
    await pressRepo.update(id, input);
  }

  const staged = parseStagedImages(val(formData, "images"));
  if (staged.length > 0) {
    const existing = await pressImageRepo.count(pressId);
    const slots = Math.max(0, MAX_IMAGES - existing);
    for (let i = 0; i < Math.min(staged.length, slots); i++) {
      await pressImageRepo.create({
        pressId,
        url: staged[i].url,
        caption: staged[i].caption,
        content: staged[i].content,
        sortOrder: existing + i,
      });
    }
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

export async function deletePressImage(formData: FormData) {
  const imageId = val(formData, "imageId");
  if (!imageId) return;
  await pressImageRepo.remove(imageId);
  revalidatePath("/admin/press");
  revalidatePath("/news/press");
}
