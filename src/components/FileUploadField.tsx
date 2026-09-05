"use client";

import { useRef, useState } from "react";

export default function FileUploadField({
  name,
  label,
  defaultValue,
  accept,
  preview = "image",
  placeholder,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  accept?: string;
  preview?: "image" | "video" | "none";
  placeholder?: string;
}) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (file.size > 4 * 1024 * 1024) {
      setError("파일 용량은 4MB를 넘을 수 없습니다.");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.set("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data: { url?: string; error?: string } = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || "업로드에 실패했습니다.");
      }
      setUrl(data.url);
    } catch (e) {
      const message = e instanceof Error ? e.message : "";
      setError(message || "업로드에 실패했습니다.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-1.5 mb-4">
      <label className="text-[12.5px] font-bold text-ink-soft">{label}</label>
      <div className="flex gap-2">
        <input
          type="text"
          name={name}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder={placeholder ?? "파일을 업로드하거나 URL을 입력하세요"}
          className="flex-1 min-w-0 border border-line-strong px-3 py-2.5 text-[13px] rounded-sm"
        />
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex-none px-3.5 py-2 border border-line-strong text-[12.5px] font-bold rounded-sm whitespace-nowrap disabled:opacity-50"
        >
          {uploading ? "업로드 중..." : "파일 선택"}
        </button>
      </div>
      {error ? (
        <p className="text-[11.5px] text-red">{error}</p>
      ) : (
        <p className="text-[11px] text-ink-faint">
          파일 업로드는 4MB까지 가능합니다. 더 큰 동영상은 유튜브 등에 올린 뒤 그 주소를 입력해 주세요.
        </p>
      )}
      {preview === "image" && url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt="미리보기"
          className="mt-1 max-h-[140px] w-auto border border-line-strong object-contain bg-surface-alt"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
          onLoad={(e) => {
            e.currentTarget.style.display = "";
          }}
        />
      )}
      {preview === "video" && url && <video src={url} controls className="mt-1 max-h-[160px] w-auto bg-black" />}
    </div>
  );
}
