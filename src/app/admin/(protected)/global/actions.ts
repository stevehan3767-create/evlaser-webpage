"use server";

import { revalidatePath } from "next/cache";
import { officeRepo, distributorRepo, type MapProvider } from "@/lib/repo";

export async function saveOffice(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const mapProvider: MapProvider = formData.get("mapProvider") === "google" ? "google" : "naver";
  const latRaw = String(formData.get("lat") ?? "").trim();
  const lngRaw = String(formData.get("lng") ?? "").trim();
  const lat = latRaw && !Number.isNaN(Number(latRaw)) ? Number(latRaw) : undefined;
  const lng = lngRaw && !Number.isNaN(Number(lngRaw)) ? Number(lngRaw) : undefined;
  if (!name || !address) return;

  const input = { name, address, phone: phone || undefined, email: email || undefined, mapProvider, lat, lng };
  if (id) {
    await officeRepo.update(id, input);
  } else {
    await officeRepo.create(input);
  }
  revalidatePath("/admin/global");
  revalidatePath("/global");
}

export async function deleteOffice(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await officeRepo.remove(id);
  revalidatePath("/admin/global");
  revalidatePath("/global");
}

export async function saveDistributor(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  const country = String(formData.get("country") ?? "").trim();
  const partner = String(formData.get("partner") ?? "").trim();
  const contact = String(formData.get("contact") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  if (!country || !partner) return;

  const input = { country, partner, contact: contact || undefined, phone: phone || undefined };
  if (id) {
    await distributorRepo.update(id, input);
  } else {
    await distributorRepo.create(input);
  }
  revalidatePath("/admin/global");
  revalidatePath("/global");
}

export async function deleteDistributor(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await distributorRepo.remove(id);
  revalidatePath("/admin/global");
  revalidatePath("/global");
}
