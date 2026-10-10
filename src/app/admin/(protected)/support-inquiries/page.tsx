import Link from "next/link";
import SubmitButton from "@/components/SubmitButton";
import { supportPostRepo } from "@/lib/repo";
import { saveSupportPost, deleteSupportPost, moveSupportPost } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminSupportInquiriesPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const { edit } = await searchParams;
  const posts = await supportPostRepo.list();
  const editing = edit ? posts.find((p) => p.id === edit) : undefined;

  const inputCls = "w-full border border-line-strong px-3 py-2.5 text-[13.5px] rounded-sm";

  return (
    <div>
      <h1 className="text-[22px] font-[family-name:var(--font-display)] tracking-tight mb-2">고객지원 문의접수 게시판 관리</h1>
      <p className="text-[13px] text-ink-soft mb-6">
        홈페이지 <b>문의하기 → 문의 접수</b> 화면의 &quot;최근 접수된 문의&quot; 목록에 표시되는 글입니다(상위 5건 노출).
        구 홈페이지에서 이관한 내역이 등록되어 있으며, 새 문의가 접수되면 자동으로 맨 위에 추가됩니다.
        본문·연락처 등은 공개되지 않고 <b>번호·제목·작성자(마스킹)·작성일·상태</b>만 표시됩니다. 아래에서 수정·삭제·순서 변경이 가능합니다.
      </p>

      <form key={editing?.id ?? "new"} action={saveSupportPost} className="border border-line p-5 mb-8 grid gap-3.5 max-w-[640px]">
        <input type="hidden" name="id" value={editing?.id ?? ""} />
        <div className="grid grid-cols-2 gap-3.5">
          <div>
            <label className="text-[12.5px] font-bold text-ink-soft block mb-1.5">번호</label>
            <input name="postNo" defaultValue={editing?.postNo ?? ""} placeholder="예: 121" className={inputCls} />
          </div>
          <div>
            <label className="text-[12.5px] font-bold text-ink-soft block mb-1.5">작성일</label>
            <input name="postedOn" defaultValue={editing?.postedOn ?? ""} placeholder="예: 2026.09.03" className={inputCls} />
          </div>
        </div>
        <div>
          <label className="text-[12.5px] font-bold text-ink-soft block mb-1.5">제목</label>
          <input name="title" defaultValue={editing?.title ?? ""} required className={inputCls} />
        </div>
        <div className="grid grid-cols-2 gap-3.5">
          <div>
            <label className="text-[12.5px] font-bold text-ink-soft block mb-1.5">작성자(마스킹된 이름)</label>
            <input name="author" defaultValue={editing?.author ?? ""} placeholder="예: 홍*동" className={inputCls} />
          </div>
          <div>
            <label className="text-[12.5px] font-bold text-ink-soft block mb-1.5">상태</label>
            <select name="status" defaultValue={editing?.status ?? "answered"} className={inputCls}>
              <option value="answered">답변완료</option>
              <option value="received">접수</option>
            </select>
          </div>
        </div>
        <div className="flex gap-3">
          <SubmitButton className="justify-self-start px-5 py-2.5 bg-red text-white font-bold text-[13px]">
            {editing ? "저장" : "추가"}
          </SubmitButton>
          {editing && (
            <Link href="/admin/support-inquiries" className="inline-flex items-center px-5 py-2.5 border border-line-strong text-[13px] font-bold">
              취소
            </Link>
          )}
        </div>
      </form>

      <p className="text-[12.5px] text-ink-faint mb-2">전체 {posts.length}건 (화면에는 상위 5건 노출)</p>
      <div className="border border-line">
        <div className="hidden sm:grid grid-cols-[60px_1fr_120px_104px_90px_150px] gap-3 px-3.5 py-2.5 border-b border-line-strong text-[12px] font-bold text-ink-soft bg-surface-alt">
          <span>번호</span><span>제목</span><span>작성자</span><span>작성일</span><span>상태</span><span className="text-right">관리</span>
        </div>
        {posts.length === 0 ? (
          <p className="p-4 text-[13px] text-ink-soft">등록된 문의가 없습니다.</p>
        ) : (
          posts.map((p, i) => (
            <div key={p.id} className="grid grid-cols-1 sm:grid-cols-[60px_1fr_120px_104px_90px_150px] gap-1 sm:gap-3 items-center px-3.5 py-3 border-b border-line last:border-b-0 text-[13px]">
              <span className="font-mono text-ink-faint">{p.postNo ?? ""}</span>
              <span className="truncate font-medium">{p.title}</span>
              <span className="text-ink-soft">{p.author ?? ""}</span>
              <span className="font-mono text-ink-faint text-[12px]">{p.postedOn ?? ""}</span>
              <span>
                <span className={`inline-block text-[10.5px] font-bold rounded-full px-2 py-0.5 border ${p.status === "answered" ? "text-[#0a7d3c] bg-[#e4f6ec] border-[#bfe8cd]" : "text-[#9a6b00] bg-[#fdf3dc] border-[#f3e0a8]"}`}>
                  {p.status === "answered" ? "답변완료" : "접수"}
                </span>
              </span>
              <div className="flex gap-2.5 justify-start sm:justify-end flex-none items-center">
                <form action={moveSupportPost}>
                  <input type="hidden" name="id" value={p.id} />
                  <input type="hidden" name="direction" value="up" />
                  <button type="submit" disabled={i === 0} className="text-[12px] text-ink-soft font-bold disabled:opacity-30" title="위로">▲</button>
                </form>
                <form action={moveSupportPost}>
                  <input type="hidden" name="id" value={p.id} />
                  <input type="hidden" name="direction" value="down" />
                  <button type="submit" disabled={i === posts.length - 1} className="text-[12px] text-ink-soft font-bold disabled:opacity-30" title="아래로">▼</button>
                </form>
                <Link href={`/admin/support-inquiries?edit=${p.id}`} className="text-[12px] text-blue font-bold">수정</Link>
                <form action={deleteSupportPost}>
                  <input type="hidden" name="id" value={p.id} />
                  <button type="submit" className="text-[12px] text-red font-bold">삭제</button>
                </form>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
