"use server";

import { revalidatePath } from "next/cache";
import { contentGroups } from "@/lib/data";
import { contentPageRepo, contentCaseRepo, contentImageRepo } from "@/lib/repo";

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

export async function createContentImage(formData: FormData) {
  const group = String(formData.get("group") ?? "");
  const key = String(formData.get("key") ?? "");
  const url = String(formData.get("url") ?? "").trim();
  const caption = String(formData.get("caption") ?? "").trim();
  if (!isValid(group, key) || !url) return;

  await contentImageRepo.create({ groupKey: group, itemKey: key, url, caption: caption || undefined });
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

export async function saveContentCase(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  const group = String(formData.get("group") ?? "");
  const key = String(formData.get("key") ?? "");
  const productName = String(formData.get("productName") ?? "").trim();
  const equipmentImageUrl = String(formData.get("equipmentImageUrl") ?? "").trim();
  const videoUrl = String(formData.get("videoUrl") ?? "").trim();
  const productImageUrl = String(formData.get("productImageUrl") ?? "").trim();
  if (!isValid(group, key) || !productName) return;

  const input = {
    productName,
    equipmentImageUrl: equipmentImageUrl || undefined,
    videoUrl: videoUrl || undefined,
    productImageUrl: productImageUrl || undefined,
  };
  if (id) {
    await contentCaseRepo.update(id, input);
  } else {
    await contentCaseRepo.create({ groupKey: group, itemKey: key, ...input });
  }
  revalidatePath("/admin/content-pages");
  revalidatePath(`/products/${group}/${key}`);
}

export async function deleteContentCase(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const group = String(formData.get("group") ?? "");
  const key = String(formData.get("key") ?? "");
  if (!id) return;
  await contentCaseRepo.remove(id);
  revalidatePath("/admin/content-pages");
  if (group && key) revalidatePath(`/products/${group}/${key}`);
}
