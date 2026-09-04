"use server";

import { revalidatePath } from "next/cache";
import { contentGroups } from "@/lib/data";
import { contentPageRepo, contentImageRepo, contentVideoRepo } from "@/lib/repo";

const MAX_IMAGES = 10;
const MAX_VIDEOS = 5;

function isValid(group: string, key: string): boolean {
  const meta = contentGroups[group];
  return !!meta && meta.items.some((i) => i.key === key);
}

export async function saveContentPage(formData: FormData) {
  const group = String(formData.get("group") ?? "");
  const key = String(formData.get("key") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const imageUrl = String(formData.get("imageUrl") ?? "").trim();
  if (!isValid(group, key)) return;

  await contentPageRepo.upsert(group, key, { title, description, imageUrl: imageUrl || undefined });
  revalidatePath("/admin/content-pages");
  revalidatePath(`/products/${group}/${key}`);
}

export async function saveContentImage(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  const group = String(formData.get("group") ?? "");
  const key = String(formData.get("key") ?? "");
  const url = String(formData.get("url") ?? "").trim();
  const caption = String(formData.get("caption") ?? "").trim();
  if (!isValid(group, key) || !url) return;

  if (id) {
    await contentImageRepo.update(id, { url, caption: caption || undefined });
  } else {
    if ((await contentImageRepo.count(group, key)) >= MAX_IMAGES) return;
    await contentImageRepo.create({ groupKey: group, itemKey: key, url, caption: caption || undefined });
  }
  revalidatePath("/admin/content-pages");
  revalidatePath(`/products/${group}/${key}`);
}

export async function deleteContentImage(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const group = String(formData.get("group") ?? "");
  const key = String(formData.get("key") ?? "");
  if (!id) return;
  await contentImageRepo.remove(id);
  revalidatePath("/admin/content-pages");
  if (group && key) revalidatePath(`/products/${group}/${key}`);
}

export async function saveContentVideo(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  const group = String(formData.get("group") ?? "");
  const key = String(formData.get("key") ?? "");
  const url = String(formData.get("url") ?? "").trim();
  const thumbnailUrl = String(formData.get("thumbnailUrl") ?? "").trim();
  const caption = String(formData.get("caption") ?? "").trim();
  if (!isValid(group, key) || !url) return;

  const input = { url, thumbnailUrl: thumbnailUrl || undefined, caption: caption || undefined };
  if (id) {
    await contentVideoRepo.update(id, input);
  } else {
    if ((await contentVideoRepo.count(group, key)) >= MAX_VIDEOS) return;
    await contentVideoRepo.create({ groupKey: group, itemKey: key, ...input });
  }
  revalidatePath("/admin/content-pages");
  revalidatePath(`/products/${group}/${key}`);
}

export async function deleteContentVideo(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const group = String(formData.get("group") ?? "");
  const key = String(formData.get("key") ?? "");
  if (!id) return;
  await contentVideoRepo.remove(id);
  revalidatePath("/admin/content-pages");
  if (group && key) revalidatePath(`/products/${group}/${key}`);
}
