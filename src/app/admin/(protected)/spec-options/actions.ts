"use server";

import { revalidatePath } from "next/cache";
import { specOptionRepo } from "@/lib/repo";

function revalidate() {
  revalidatePath("/admin/spec-options");
  revalidatePath("/admin/content-pages");
}

export async function saveSpecOption(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  const label = String(formData.get("label") ?? "").trim();
  if (!label) return;
  if (id) {
    await specOptionRepo.update(id, { label });
  } else {
    await specOptionRepo.create({ label });
  }
  revalidate();
}

export async function deleteSpecOption(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await specOptionRepo.remove(id);
  revalidate();
}

export async function moveSpecOption(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const direction = String(formData.get("direction") ?? "");
  if (!id || (direction !== "up" && direction !== "down")) return;
  await specOptionRepo.move(id, direction);
  revalidate();
}
