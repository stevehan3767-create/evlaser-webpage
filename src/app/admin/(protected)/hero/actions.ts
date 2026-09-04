"use server";

import { revalidatePath } from "next/cache";
import { heroSlideRepo } from "@/lib/repo";

const MAX_SLIDES = 5;

export async function saveHeroSlide(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  const imageUrl = String(formData.get("imageUrl") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  if (!imageUrl || !title) return;

  if (id) {
    await heroSlideRepo.update(id, { imageUrl, title });
  } else {
    if ((await heroSlideRepo.count()) >= MAX_SLIDES) return;
    await heroSlideRepo.create({ imageUrl, title });
  }
  revalidatePath("/admin/hero");
  revalidatePath("/");
}

export async function deleteHeroSlide(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await heroSlideRepo.remove(id);
  revalidatePath("/admin/hero");
  revalidatePath("/");
}
