"use server";

import { revalidatePath } from "next/cache";
import { patentRepo, certificationRepo } from "@/lib/repo";

function revalidate() {
  revalidatePath("/admin/patents");
  revalidatePath("/company/patents");
}

// ---- 특허 ----
export async function savePatent(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const imageUrl = String(formData.get("imageUrl") ?? "").trim();
  const registeredOn = String(formData.get("registeredOn") ?? "").trim() || null;
  if (!title || !imageUrl) return;

  if (id) {
    await patentRepo.update(id, { imageUrl, title, registeredOn });
  } else {
    await patentRepo.create({ imageUrl, title, registeredOn });
  }
  revalidate();
}

export async function deletePatent(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await patentRepo.remove(id);
  revalidate();
}

// ---- 인증서 ----
export async function saveCertification(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const subtitle = String(formData.get("subtitle") ?? "").trim() || null;
  const imageUrl = String(formData.get("imageUrl") ?? "").trim();
  if (!title || !imageUrl) return;

  if (id) {
    await certificationRepo.update(id, { imageUrl, title, subtitle });
  } else {
    await certificationRepo.create({ imageUrl, title, subtitle });
  }
  revalidate();
}

export async function deleteCertification(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await certificationRepo.remove(id);
  revalidate();
}

export async function moveCertification(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const direction = String(formData.get("direction") ?? "");
  if (!id || (direction !== "up" && direction !== "down")) return;
  await certificationRepo.move(id, direction);
  revalidate();
}
