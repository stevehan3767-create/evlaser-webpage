"use server";

import { revalidatePath } from "next/cache";
import { newsRepo, newsImageRepo } from "@/lib/repo";

const MAX_IMAGES = 12;

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

export async function saveNews(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  const tag = String(formData.get("tag") ?? "회사소식");
  const title = String(formData.get("title") ?? "").trim();
  const date = String(formData.get("date") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const author = String(formData.get("author") ?? "").trim() || null;
  const viewsRaw = String(formData.get("views") ?? "").replace(/[^\d]/g, "").trim();
  const views = viewsRaw ? parseInt(viewsRaw, 10) : null;
  const postNo = String(formData.get("postNo") ?? "").trim() || null;
  const staged = parseStagedImages(String(formData.get("images") ?? ""));

  if (!title || !date) return;

  const newsId = id || (await newsRepo.create({ tag, title, date, body, published: true, author, views, postNo }));
  if (id) {
    await newsRepo.update(id, { tag, title, date, body, author, views, postNo });
  }

  if (staged.length > 0) {
    const existing = await newsImageRepo.count(newsId);
    const slots = Math.max(0, MAX_IMAGES - existing);
    for (let i = 0; i < Math.min(staged.length, slots); i++) {
      await newsImageRepo.create({
        newsId,
        url: staged[i].url,
        caption: staged[i].caption,
        content: staged[i].content,
        sortOrder: existing + i,
      });
    }
  }

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

export async function deleteNewsImage(formData: FormData) {
  const imageId = String(formData.get("imageId") ?? "");
  if (!imageId) return;
  await newsImageRepo.remove(imageId);
  revalidatePath("/admin/news");
  revalidatePath("/news");
}
