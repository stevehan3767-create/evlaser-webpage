"use server";

import { revalidatePath } from "next/cache";
import { supportPostRepo } from "@/lib/repo";

function revalidate() {
  revalidatePath("/admin/support-inquiries");
  revalidatePath("/support");
}

export async function saveSupportPost(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const postNo = String(formData.get("postNo") ?? "").trim() || null;
  const author = String(formData.get("author") ?? "").trim() || null;
  const postedOn = String(formData.get("postedOn") ?? "").trim() || null;
  const status = String(formData.get("status") ?? "answered").trim();
  if (!title) return;

  if (id) {
    await supportPostRepo.update(id, { postNo, title, author, postedOn, status });
  } else {
    await supportPostRepo.create({ postNo, title, author, postedOn, status, sortOrder: 0 });
  }
  revalidate();
}

export async function deleteSupportPost(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await supportPostRepo.remove(id);
  revalidate();
}

export async function moveSupportPost(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const direction = String(formData.get("direction") ?? "");
  if (!id || (direction !== "up" && direction !== "down")) return;
  await supportPostRepo.move(id, direction);
  revalidate();
}
