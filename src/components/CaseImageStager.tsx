"use client";

import { useState } from "react";
import FileUploadField from "./FileUploadField";

export interface StagedImage {
  url: string;
  caption: string;
  content: string;
}

export default function CaseImageStager({ fieldName, remaining }: { fieldName: string; remaining: number }) {
  const [staged, setStaged] = useState<StagedImage[]>([]);
  const [url, setUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [content, setContent] = useState("");
  const [fieldKey, setFieldKey] = useState(0);
  const [notice, setNotice] = useState("");

  const slotsLeft = remaining - staged.length;

  function stageCurrent() {
    if (!url) {
      setNotice("이미지를 먼저 업로드하거나 URL을 입력해 주세요.");
      return;
    }
    if (slotsLeft <= 0) {
      setNotice(`더 이상 추가할 수 없습니다 (최대 ${remaining}개).`);
      return;
    }
    setStaged((s) => [...s, { url, caption, content }]);
    setUrl("");
    setCaption("");
    setContent("");
    setFieldKey((k) => k + 1);
    setNotice("");
  }

  function removeStaged(i: number) {
    setStaged((s) => s.filter((_, idx) => idx !== i));
  }

  return (
    <div className="grid gap-3.5">
      <input type="hidden" name={fieldName} value={JSON.stringify(staged)} />

      {staged.length > 0 && (
        <div className="border border-line-strong rounded-sm divide-y divide-line">
          {staged.map((s, i) => (
            <div key={i} className="flex items-center gap-3 p-2.5 text-[12.5px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.url} alt="" className="w-10 h-10 flex-none object-cover border border-line-strong bg-surface-alt" />
              <span className="flex-1 min-w-0 truncate">{s.caption || `추가할 사진 ${i + 1}`}</span>
              <button type="button" onClick={() => removeStaged(i)} className="text-red font-bold flex-none">
                취소
              </button>
            </div>
          ))}
        </div>
      )}

      {slotsLeft <= 0 ? (
        <p className="text-[12.5px] text-ink-soft">더 이상 추가할 수 없습니다 (최대 {remaining}개).</p>
      ) : (
        <>
          <div>
            <label className="text-[12.5px] font-bold text-ink-soft block mb-1.5">제목 (선택)</label>
            <input
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="예: 제품명"
              className="w-full border border-line-strong px-3 py-2.5 text-[13.5px] rounded-sm"
            />
          </div>
          <div>
            <label className="text-[12.5px] font-bold text-ink-soft block mb-1.5">내용 (선택, 2줄 이내 권장)</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={2}
              className="w-full border border-line-strong px-3 py-2.5 text-[13.5px] rounded-sm resize-y"
            />
          </div>
          <FileUploadField key={fieldKey} name="__caseImageDraft" label="이미지" onValueChange={setUrl} accept="image/*" preview="image" />
          {notice && <p className="text-[12px] text-red">{notice}</p>}
          <button
            type="button"
            onClick={stageCurrent}
            className="justify-self-start px-4 py-2 border border-line-strong text-[12.5px] font-bold rounded-sm hover:border-blue hover:text-blue"
          >
            + 사진 추가 (저장 전 임시 등록)
          </button>
        </>
      )}
    </div>
  );
}
