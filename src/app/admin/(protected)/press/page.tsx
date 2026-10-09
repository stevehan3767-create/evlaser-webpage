import Link from "next/link";
import SubmitButton from "@/components/SubmitButton";
import FileUploadField from "@/components/FileUploadField";
import { pressRepo } from "@/lib/repo";
import { savePress, deletePress } from "./actions";

export const dynamic = "force-dynamic";

const CAT_LABEL: Record<string, string> = {
  media: "언론보도",
  broadcast: "방송",
  paper: "논문·학회",
};

export default async function AdminPressPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const { edit } = await searchParams;
  const items = await pressRepo.list();
  const editing = edit ? items.find((i) => i.id === edit) : undefined;

  return (
    <div>
      <h1 className="text-[22px] font-[family-name:var(--font-display)] tracking-tight mb-6">
        언론·연구활동 관리{editing && " — 수정"}
      </h1>

      <form key={editing?.id ?? "new"} action={savePress} className="border border-line p-5 mb-8 grid gap-3.5">
        <input type="hidden" name="id" value={editing?.id ?? ""} />

        <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr_140px] gap-3.5">
          <select name="category" defaultValue={editing?.category ?? "media"} className="border border-line-strong px-3 py-2.5 text-[13.5px] rounded-sm">
            <option value="media">언론보도</option>
            <option value="broadcast">방송</option>
            <option value="paper">논문·학회</option>
          </select>
          <input
            name="source"
            placeholder="출처/매체 (예: 강소기업뉴스 · 양해원 기자)"
            defaultValue={editing?.source ?? ""}
            className="border border-line-strong px-3 py-2.5 text-[13.5px] rounded-sm"
          />
          <input
            name="date"
            placeholder="2025.11.19"
            defaultValue={editing?.date ?? ""}
            className="border border-line-strong px-3 py-2.5 text-[13.5px] rounded-sm"
          />
        </div>

        <input
          name="title"
          placeholder="제목"
          defaultValue={editing?.title ?? ""}
          required
          className="border border-line-strong px-3 py-2.5 text-[13.5px] rounded-sm"
        />

        <input
          name="linkUrl"
          placeholder="원문 링크 URL (선택)"
          defaultValue={editing?.linkUrl ?? ""}
          className="border border-line-strong px-3 py-2.5 text-[13.5px] rounded-sm"
        />

        <textarea
          name="body"
          placeholder="본문 (추출 텍스트) — 줄바꿈이 그대로 표시됩니다."
          defaultValue={editing?.body ?? ""}
          rows={10}
          className="border border-line-strong px-3 py-2.5 text-[13.5px] rounded-sm resize-y"
        />

        <FileUploadField
          name="pdfUrl"
          label="PDF 원문 (다운로드용)"
          defaultValue={editing?.pdfUrl ?? ""}
          accept="application/pdf"
          preview="none"
          fileNameFieldName="pdfName"
          defaultFileName={editing?.pdfName ?? ""}
        />

        <FileUploadField
          name="thumbnailUrl"
          label="썸네일 이미지 (선택)"
          defaultValue={editing?.thumbnailUrl ?? ""}
          accept="image/*"
          preview="image"
        />

        <div className="flex gap-3">
          <SubmitButton className="justify-self-start px-5 py-2.5 bg-red text-white font-bold text-[13px]">
            {editing ? "저장" : "추가"}
          </SubmitButton>
          {editing && (
            <Link href="/admin/press" className="inline-flex items-center px-5 py-2.5 border border-line-strong text-[13px] font-bold">
              취소
            </Link>
          )}
        </div>
      </form>

      <div className="border border-line">
        {items.length === 0 ? (
          <p className="p-4 text-[13px] text-ink-soft">등록된 자료가 없습니다.</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="flex items-start justify-between gap-4 p-3.5 border-b border-line last:border-b-0 text-[13px]">
              <span className="font-mono text-[10.5px] text-blue border border-line-strong px-1.5 py-0.5 flex-none mt-0.5">
                {CAT_LABEL[item.category] ?? item.category}
              </span>
              <div className="flex-1 min-w-0">
                <p className="truncate">{item.title}</p>
                <p className="mt-1 text-[12px] text-ink-faint">
                  {[item.source, item.date].filter(Boolean).join(" · ")}
                  {item.pdfUrl && " · PDF"}
                  {item.linkUrl && " · 링크"}
                </p>
              </div>
              <div className="flex gap-3 flex-none">
                <Link href={`/admin/press?edit=${item.id}`} className="text-[12px] text-blue font-bold">
                  수정
                </Link>
                <form action={deletePress}>
                  <input type="hidden" name="id" value={item.id} />
                  <button type="submit" className="text-[12px] text-red font-bold">
                    삭제
                  </button>
                </form>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
