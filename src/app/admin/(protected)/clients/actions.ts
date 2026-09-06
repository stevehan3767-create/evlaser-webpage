"use server";

import { revalidatePath } from "next/cache";
import { clientLogoRepo } from "@/lib/repo";

export async function saveClientLogo(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const logoUrl = String(formData.get("logoUrl") ?? "").trim();
  if (!name || !logoUrl) return;

  if (id) {
    await clientLogoRepo.update(id, { name, logoUrl });
  } else {
    await clientLogoRepo.create({ name, logoUrl });
  }
  revalidatePath("/admin/clients");
  revalidatePath("/");
}

export async function deleteClientLogo(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await clientLogoRepo.remove(id);
  revalidatePath("/admin/clients");
  revalidatePath("/");
}
