import Link from "next/link";
import { resourceRepo } from "@/lib/repo";
import { saveResource, deleteResource } from "./actions";

export const dynamic = "force-dynamic";

const CATEGORY_LABELS: Record<string, string> = { doc: "기술자료", video: "동영상자료실", case: "적용사례" };

export default async function AdminResourcesPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const { edit } = await searchParams;

  const items = await resourceRepo.list();
  const editing = edit ? items.find((i) => i.id === edit) : undefined;

  return (
    <div>
      <h1 className="text-[22px] font-[family-name:var(--font-display)] tracking-tight mb-6">자료실 관리{editing && " — 수정"}</h1>

      <form action={saveResource} className="border border-line p-5 mb-8 grid gap-3.5">
        <input type="hidden" name="id" value={editing?.id ?? ""} />
        <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-3.5">
          <select name="category" defaultValue={editing?.category ?? "doc"} className="border border-line-strong px-3 py-2.5 text-[13.5px] rounded-sm">
            <option value="doc">기술자료</option>
            <option value="video">동영상자료실</option>
            <option value="case">적용사례</option>
          </select>
          <input
            name="title"
            placeholder="제목"
            defaultValue={editing?.title ?? ""}
            required
            className="border border-line-strong px-3 py-2.5 text-[13.5px] rounded-sm"
          />
        </div>
        <textarea
          name="description"
          placeholder="설명"
          defaultValue={editing?.description ?? ""}
          required
          rows={2}
          className="border border-line-strong px-3 py-2.5 text-[13.5px] rounded-sm"
        />
        <input
          name="url"
          placeholder="링크 URL (선택, 파일/영상 주소)"
          defaultValue={editing?.url ?? ""}
          className="border border-line-strong px-3 py-2.5 text-[13.5px] rounded-sm"
        />
        <div className="flex gap-3">
          <button type="submit" className="justify-self-start px-5 py-2.5 bg-red text-white font-bold text-[13px]">
            {editing ? "저장" : "추가"}
          </button>
          {editing && (
            <Link href="/admin/resources" className="inline-flex items-center px-5 py-2.5 border border-line-strong text-[13px] font-bold">
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
            <div key={item.id} className="flex items-start justify-between gap-4 p-3.5 border-b border-line last:border-b-0">
              <div className="text-[13px] flex-1">
                <span className="font-mono text-[10.5px] text-blue border border-line-strong px-1.5 py-0.5 mr-2">
                  {CATEGORY_LABELS[item.category] ?? item.category}
                </span>
                <span className="font-bold">{item.title}</span>
                <p className="text-ink-soft mt-1">{item.description}</p>
              </div>
              <div className="flex gap-3 flex-none">
                <Link href={`/admin/resources?edit=${item.id}`} className="text-[12px] text-blue font-bold">
                  수정
                </Link>
                <form action={deleteResource}>
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
