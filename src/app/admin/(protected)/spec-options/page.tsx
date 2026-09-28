import Link from "next/link";
import { specOptionRepo, seedSpecOptionsIfEmpty } from "@/lib/repo";
import { specOptionDefaults } from "@/lib/data";
import { saveSpecOption, deleteSpecOption, moveSpecOption } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminSpecOptionsPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const { edit } = await searchParams;
  await seedSpecOptionsIfEmpty(specOptionDefaults);
  const options = await specOptionRepo.list();
  const editing = edit ? options.find((o) => o.id === edit) : undefined;

  return (
    <div>
      <h1 className="text-[22px] font-[family-name:var(--font-display)] tracking-tight mb-2">사양서 옵션 목록 관리</h1>
      <p className="text-[13px] text-ink-soft mb-6">
        여기에 등록한 옵션은 제품·기술 페이지 관리의 <b>&quot;옵션 선택&quot;</b>에서 체크박스로 표시됩니다. 각 설비에서 해당 옵션을
        체크하면 사양서(주요 사양) 맨 아래 <b>옵션(Options)</b> 행에 자동으로 추가됩니다. 표시 순서는 &quot;위/아래&quot; 버튼으로 조정하세요.
      </p>

      <form key={editing?.id ?? "new"} action={saveSpecOption} className="border border-line p-5 mb-8 grid gap-3.5 max-w-[560px]">
        <input type="hidden" name="id" value={editing?.id ?? ""} />
        <div>
          <label className="text-[12.5px] font-bold text-ink-soft block mb-1.5">옵션명</label>
          <input
            name="label"
            defaultValue={editing?.label ?? ""}
            required
            placeholder="예: ATC (Auto Tool Change)"
            className="w-full border border-line-strong px-3 py-2.5 text-[13.5px] rounded-sm"
          />
        </div>
        <div className="flex gap-3">
          <button type="submit" className="justify-self-start px-5 py-2.5 bg-red text-white font-bold text-[13px]">
            {editing ? "저장" : "추가"}
          </button>
          {editing && (
            <Link href="/admin/spec-options" className="inline-flex items-center px-5 py-2.5 border border-line-strong text-[13px] font-bold">
              취소
            </Link>
          )}
        </div>
      </form>

      <div className="border border-line">
        {options.length === 0 ? (
          <p className="p-4 text-[13px] text-ink-soft">등록된 옵션이 없습니다.</p>
        ) : (
          options.map((o, i) => (
            <div key={o.id} className="flex items-center justify-between gap-4 p-3.5 border-b border-line last:border-b-0 text-[13px]">
              <div className="flex items-center gap-3.5 flex-1 min-w-0">
                <span className="font-mono text-ink-faint w-6 flex-none text-right">{i + 1}</span>
                <p className="font-bold truncate">{o.label}</p>
              </div>
              <div className="flex items-center gap-2 flex-none">
                <form action={moveSpecOption}>
                  <input type="hidden" name="id" value={o.id} />
                  <input type="hidden" name="direction" value="up" />
                  <button type="submit" disabled={i === 0} className="px-2 py-1 border border-line-strong text-[12px] disabled:opacity-30" aria-label="위로">
                    ▲
                  </button>
                </form>
                <form action={moveSpecOption}>
                  <input type="hidden" name="id" value={o.id} />
                  <input type="hidden" name="direction" value="down" />
                  <button type="submit" disabled={i === options.length - 1} className="px-2 py-1 border border-line-strong text-[12px] disabled:opacity-30" aria-label="아래로">
                    ▼
                  </button>
                </form>
                <Link href={`/admin/spec-options?edit=${o.id}`} className="text-[12px] text-blue font-bold">
                  수정
                </Link>
                <form action={deleteSpecOption}>
                  <input type="hidden" name="id" value={o.id} />
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
