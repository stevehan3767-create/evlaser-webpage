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

  const imgId = String(formData.get("imgId") ?? "").trim();
  const imgUrl = String(formData.get("imgUrl") ?? "").trim();
  const imgCaption = String(formData.get("imgCaption") ?? "").trim();
  const imgContent = String(formData.get("imgContent") ?? "").trim();
  let msg = "page_saved";
  if (imgUrl) {
    if (imgId) {
      await contentImageRepo.update(imgId, { url: imgUrl, caption: imgCaption || undefined, content: imgContent || undefined });
      msg = "image_saved";
    } else if ((await contentImageRepo.count(group, key)) < MAX_IMAGES) {
      await contentImageRepo.create({
        groupKey: group,
        itemKey: key,
        url: imgUrl,
        caption: imgCaption || undefined,
        content: imgContent || undefined,
      });
      msg = "image_added";
    } else {
      msg = "image_max";
    }
  }

  const vidId = String(formData.get("vidId") ?? "").trim();
  const vidUrl = String(formData.get("vidUrl") ?? "").trim();
  const vidThumbnailUrl = String(formData.get("vidThumbnailUrl") ?? "").trim();
  const vidCaption = String(formData.get("vidCaption") ?? "").trim();
  const vidContent = String(formData.get("vidContent") ?? "").trim();
  if (vidUrl) {
    const vidInput = {
      url: vidUrl,
      thumbnailUrl: vidThumbnailUrl || undefined,
      caption: vidCaption || undefined,
      content: vidContent || undefined,
    };
    if (vidId) {
      await contentVideoRepo.update(vidId, vidInput);
      msg = "video_saved";
    } else if ((await contentVideoRepo.count(group, key)) < MAX_VIDEOS) {
      await contentVideoRepo.create({ groupKey: group, itemKey: key, ...vidInput });
      msg = "video_added";
    } else {
      msg = "video_max";
    }
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
