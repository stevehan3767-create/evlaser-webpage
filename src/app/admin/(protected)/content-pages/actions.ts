"use server";

import { revalidatePath } from "next/cache";
import { contentGroups } from "@/lib/data";
import { contentPageRepo, contentCaseRepo } from "@/lib/repo";

function isValid(group: string, key: string): boolean {
  const meta = contentGroups[group];
  return !!meta && meta.items.some((i) => i.key === key);
}

export async function saveContentPage(formData: FormData) {
  const group = String(formData.get("group") ?? "");
  const key = String(formData.get("key") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  if (!isValid(group, key)) return;

  await contentPageRepo.upsert(group, key, { title, description });
  revalidatePath("/admin/content-pages");
  revalidatePath(`/products/${group}/${key}`);
}

export async function createContentCase(formData: FormData) {
  const group = String(formData.get("group") ?? "");
  const key = String(formData.get("key") ?? "");
  const productName = String(formData.get("productName") ?? "").trim();
  const equipmentImageUrl = String(formData.get("equipmentImageUrl") ?? "").trim();
  const videoUrl = String(formData.get("videoUrl") ?? "").trim();
  const productImageUrl = String(formData.get("productImageUrl") ?? "").trim();
  if (!isValid(group, key) || !productName) return;

  await contentCaseRepo.create({
    groupKey: group,
    itemKey: key,
    productName,
    equipmentImageUrl: equipmentImageUrl || undefined,
    videoUrl: videoUrl || undefined,
    productImageUrl: productImageUrl || undefined,
  });
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
