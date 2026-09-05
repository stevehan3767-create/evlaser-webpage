export type EmbeddableVideo = { kind: "video" | "iframe"; src: string };

export function toEmbeddableVideo(url: string): EmbeddableVideo {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");

    if (host === "youtube.com" || host === "m.youtube.com" || host === "youtu.be") {
      let id = "";
      if (host === "youtu.be") {
        id = u.pathname.slice(1);
      } else if (u.pathname === "/watch") {
        id = u.searchParams.get("v") ?? "";
      } else if (u.pathname.startsWith("/embed/")) {
        id = u.pathname.split("/embed/")[1] ?? "";
      } else if (u.pathname.startsWith("/shorts/")) {
        id = u.pathname.split("/shorts/")[1] ?? "";
      }
      id = id.split("/")[0]?.split("?")[0] ?? "";
      if (id) return { kind: "iframe", src: `https://www.youtube.com/embed/${id}` };
    }

    if (host === "vimeo.com") {
      const id = u.pathname.split("/").filter(Boolean).pop();
      if (id) return { kind: "iframe", src: `https://player.vimeo.com/video/${id}` };
    }

    if (/\.(mp4|webm|ogg|ogv|mov)$/i.test(u.pathname)) {
      return { kind: "video", src: url };
    }
  } catch {
    // not a valid absolute URL — fall through to the iframe-as-is default
  }
  return { kind: "iframe", src: url };
}
