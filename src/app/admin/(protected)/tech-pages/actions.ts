"use server";

import { revalidatePath } from "next/cache";
import { techItems } from "@/lib/data";
import { techPageRepo, techCaseRepo } from "@/lib/repo";

const VALID_KEYS = new Set(techItems.map((t) => t.key));

export async function saveTechPage(formData: FormData) {
  const key = String(formData.get("key") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  if (!VALID_KEYS.has(key)) return;

  await techPageRepo.upsert(key, { title, description });
  revalidatePath("/admin/tech-pages");
  revalidatePath(`/products/tech/${key}`);
}

export async function createTechCase(formData: FormData) {
  const techKey = String(formData.get("techKey") ?? "");
  const productName = String(formData.get("productName") ?? "").trim();
  const equipmentImageUrl = String(formData.get("equipmentImageUrl") ?? "").trim();
  const videoUrl = String(formData.get("videoUrl") ?? "").trim();
  const productImageUrl = String(formData.get("productImageUrl") ?? "").trim();
  if (!VALID_KEYS.has(techKey) || !productName) return;

  await techCaseRepo.create({
    techKey,
    productName,
    equipmentImageUrl: equipmentImageUrl || undefined,
    videoUrl: videoUrl || undefined,
    productImageUrl: productImageUrl || undefined,
  });
  revalidatePath("/admin/tech-pages");
  revalidatePath(`/products/tech/${techKey}`);
}

export async function deleteTechCase(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const techKey = String(formData.get("techKey") ?? "");
  if (!id) return;
  await techCaseRepo.remove(id);
  revalidatePath("/admin/tech-pages");
  if (techKey) revalidatePath(`/products/tech/${techKey}`);
}
