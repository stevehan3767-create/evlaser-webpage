"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { contentGroups, iconNames } from "@/lib/data";
import { contentPageRepo, contentImageRepo, contentVideoRepo, contentItemRepo, lineupCategoryLinkRepo } from "@/lib/repo";

const LINEUP_CATEGORY_GROUPS = ["tech", "industry", "material"] as const;

const MAX_IMAGES = 5;
const MAX_VIDEOS = 5;

async function isValid(group: string, key: string): Promise<boolean> {
  if (!contentGroups[group]) return false;
  const items = await contentItemRepo.listByGroup(group);
  return items.some((i) => i.itemKey === key);
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
  if (!(await isValid(group, key))) return;

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const imageUrl = String(formData.get("imageUrl") ?? "").trim();
  await contentPageRepo.upsert(group, key, { title, description, imageUrl: imageUrl || undefined });

  // 설비 라인업 항목은 기술종류별/산업분야별/재료별 카테고리에 각각 다중
  // 선택으로 연결할 수 있다 — 해당 카테고리의 상세페이지에 "관련 설비"
  // 목록으로 표시되고, 설비 라인업 섹션에서 카테고리별로 필터링된다.
  if (group === "lineup") {
    for (const categoryGroup of LINEUP_CATEGORY_GROUPS) {
      const keys = formData.getAll(`${categoryGroup}Keys`).map(String).filter(Boolean);
      await lineupCategoryLinkRepo.setForItem(key, categoryGroup, keys);
    }
  }

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

export async function addContentItem(formData: FormData) {
  const group = String(formData.get("group") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const icon = String(formData.get("icon") ?? "").trim();
  const insertBeforeItemKey = String(formData.get("insertBefore") ?? "").trim() || undefined;
  if (!contentGroups[group] || !name || !(iconNames as string[]).includes(icon)) return;

  const item = await contentItemRepo.create({ groupKey: group, name, icon, insertBeforeItemKey });
  revalidatePath("/admin/content-pages");
  revalidatePath("/products");
  redirect(`/admin/content-pages?group=${group}&key=${item.itemKey}&msg=item_added`);
}

export async function deleteContentItem(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const group = String(formData.get("group") ?? "");
  const key = String(formData.get("key") ?? "");
  if (!id || !group || !key) return;

  await contentItemRepo.remove(id, group, key);
  revalidatePath("/admin/content-pages");
  revalidatePath("/products");
  revalidatePath(`/products/${group}/${key}`);
  redirect(`/admin/content-pages?group=${group}&msg=item_deleted`);
}
