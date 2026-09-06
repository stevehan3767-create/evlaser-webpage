"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { contentGroups } from "@/lib/data";
import { contentPageRepo, contentImageRepo, contentVideoRepo } from "@/lib/repo";

const MAX_IMAGES = 5;
const MAX_VIDEOS = 5;

function isValid(group: string, key: string): boolean {
  const meta = contentGroups[group];
  return !!meta && meta.items.some((i) => i.key === key);
}

function backTo(group: string, key: string, msg: string): string {
  return `/admin/content-pages?group=${group}&key=${key}&msg=${msg}`;
}

function parseStagedList<T>(raw: FormDataEntryValue | null): T[] {
  if (typeof raw !== "string" || !raw.trim()) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

// Saves everything present on the page in one submit — the main title/
// image/description, and (if filled in) one 적용사례 photo and one
// 적용사례 video — so filling in several sections before pressing the
// single 저장 button never loses whichever section you filled in first.
export async function saveContentAll(formData: FormData) {
  const group = String(formData.get("group") ?? "");
  const key = String(formData.get("key") ?? "");
  if (!isValid(group, key)) return;

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const imageUrl = String(formData.get("imageUrl") ?? "").trim();
  await contentPageRepo.upsert(group, key, { title, description, imageUrl: imageUrl || undefined });

  // Editing one existing photo/video is a direct, immediate update.
  const imgId = String(formData.get("imgId") ?? "").trim();
  const imgUrl = String(formData.get("imgUrl") ?? "").trim();
  const imgCaption = String(formData.get("imgCaption") ?? "").trim();
  const imgContent = String(formData.get("imgContent") ?? "").trim();
  let msg = "page_saved";
  if (imgId && imgUrl) {
    await contentImageRepo.update(imgId, { url: imgUrl, caption: imgCaption || undefined, content: imgContent || undefined });
    msg = "image_saved";
  }

  const vidId = String(formData.get("vidId") ?? "").trim();
  const vidUrl = String(formData.get("vidUrl") ?? "").trim();
  const vidThumbnailUrl = String(formData.get("vidThumbnailUrl") ?? "").trim();
  const vidCaption = String(formData.get("vidCaption") ?? "").trim();
  const vidContent = String(formData.get("vidContent") ?? "").trim();
  if (vidId && vidUrl) {
    await contentVideoRepo.update(vidId, {
      url: vidUrl,
      thumbnailUrl: vidThumbnailUrl || undefined,
      caption: vidCaption || undefined,
      content: vidContent || undefined,
    });
    msg = "video_saved";
  }

  // New photos/videos staged client-side (add several, then one 저장 persists
  // all of them together) arrive as JSON arrays.
  const newImages = parseStagedList<{ url: string; caption: string; content: string }>(formData.get("newImages"));
  if (newImages.length > 0) {
    let count = await contentImageRepo.count(group, key);
    let added = 0;
    for (const item of newImages) {
      if (!item.url || count >= MAX_IMAGES) continue;
      await contentImageRepo.create({
        groupKey: group,
        itemKey: key,
        url: item.url,
        caption: item.caption || undefined,
        content: item.content || undefined,
      });
      count += 1;
      added += 1;
    }
    if (added > 0) msg = "image_added";
    if (added < newImages.length) msg = "image_max";
  }

  const newVideos = parseStagedList<{ url: string; thumbnailUrl: string; caption: string; content: string }>(
    formData.get("newVideos")
  );
  if (newVideos.length > 0) {
    let count = await contentVideoRepo.count(group, key);
    let added = 0;
    for (const item of newVideos) {
      if (!item.url || count >= MAX_VIDEOS) continue;
      await contentVideoRepo.create({
        groupKey: group,
        itemKey: key,
        url: item.url,
        thumbnailUrl: item.thumbnailUrl || undefined,
        caption: item.caption || undefined,
        content: item.content || undefined,
      });
      count += 1;
      added += 1;
    }
    if (added > 0) msg = "video_added";
    if (added < newVideos.length) msg = "video_max";
  }

  revalidatePath("/admin/content-pages");
  revalidatePath(`/products/${group}/${key}`);
  redirect(backTo(group, key, msg));
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

export async function deleteContentVideo(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const group = String(formData.get("group") ?? "");
  const key = String(formData.get("key") ?? "");
  if (!id) return;
  await contentVideoRepo.remove(id);
  revalidatePath("/admin/content-pages");
  if (group && key) revalidatePath(`/products/${group}/${key}`);
}
