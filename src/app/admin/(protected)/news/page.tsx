import Link from "next/link";
import SubmitButton from "@/components/SubmitButton";
import CaseImageStager from "@/components/CaseImageStager";
import { newsItems as seedNewsItems } from "@/lib/data";
import { newsRepo, newsImageRepo, seedIfEmpty } from "@/lib/repo";
import { saveNews, deleteNews, deleteNewsImage } from "./actions";

export const dynamic = "force-dynamic";

const MAX_IMAGES = 12;

// 공개 "뉴스·소식" 페이지(/news)에 노출되는 두 카테고리.
// value = 공개 페이지 필터가 쓰는 태그 값, label = 공개 탭에 보이는 이름.
const CATEGORY_OPTIONS = [
  { value: "회사소식", label: "사내소식" },
  { value: "전시회소식", label: "전시회소식" },
] as const;

export default async function AdminNewsPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const { edit } = await searchParams;

  await seedIfEmpty(seedNewsItems);
  const items = await newsRepo.list();
  const editing = edit ? items.find((i) => i.id === edit) : undefined;
  const editingImages = editing ? await newsImageRepo.listByNews(editing.id) : [];
  const imageMap = await newsImageRepo.mapForNews(items.map((i) => i.id));

  const isNotice = editing?.postNo === "공지";
  const numberValue = isNotice ? "" : (editing?.postNo ?? "");
  // 편집 중인 글의 태그가 현재 옵션에 없으면(레거시 '산업동향' 등) 임시 옵션으로 보존.
  const knownTag = CATEGORY_OPTIONS.some((c) => c.value === editing?.tag);
  const catLabel = (tag: string) => CATEGORY_OPTIONS.find((c) => c.value === tag)?.label ?? tag;

  return (
    <div>
      <h1 className="text-[22px] font-[family-name:var(--font-display)] tracking-tight mb-1.5">뉴스 관리{editing && " — 수정"}</h1>
      <p className="text-[12.5px] text-ink-soft mb-5 leading-relaxed">
        홈페이지 <b className="text-ink">뉴스·소식</b>의 <b className="text-ink">사내소식 · 전시회소식</b>을 관리합니다.
        {" "}논문·학술소식과 언론·방송소식은{" "}
        <Link href="/admin/press" className="text-blue font-bold underline underline-offset-2">언론·연구활동 관리</Link>
        {" "}메뉴에서 관리합니다.
      </p>

      <form key={editing?.id ?? "new"} action={saveNews} className="border border-line p-5 mb-8 grid gap-3.5">
        <input type="hidden" name="id" value={editing?.id ?? ""} />
        {/* 작성자는 공개 페이지에 표시되지 않지만, 기존 값은 보존한다(내부 기록용). */}
        <input type="hidden" name="author" value={editing?.author ?? ""} />

        <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr_140px] gap-3.5">
          <div>
            <label className="text-[11.5px] font-bold text-ink-soft block mb-1">카테고리</label>
            <select name="tag" defaultValue={editing?.tag ?? "회사소식"} className="w-full border border-line-strong px-3 py-2.5 text-[13.5px] rounded-sm bg-surface">
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
              {editing && !knownTag && <option value={editing.tag}>{editing.tag} (기존)</option>}
            </select>
          </div>
          <div>
            <label className="text-[11.5px] font-bold text-ink-soft block mb-1">제목</label>
            <input
              name="title"
              placeholder="제목"
              defaultValue={editing?.title ?? ""}
              required
              className="w-full border border-line-strong px-3 py-2.5 text-[13.5px] rounded-sm"
            />
          </div>
          <div>
            <label className="text-[11.5px] font-bold text-ink-soft block mb-1">등록일</label>
            <input
              name="date"
              placeholder="2026.09.01"
              defaultValue={editing?.date ?? ""}
              required
              pattern="\d{4}\.\d{2}\.\d{2}"
              title="YYYY.MM.DD 형식으로 입력"
              className="w-full border border-line-strong px-3 py-2.5 text-[13.5px] rounded-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="text-[11.5px] font-bold text-ink-soft block mb-1">글 번호 (선택)</label>
            <input name="postNo" placeholder="예: 120" defaultValue={numberValue} inputMode="numeric" className="w-full border border-line-strong px-3 py-2.5 text-[13.5px] rounded-sm" />
          </div>
          <div>
            <label className="text-[11.5px] font-bold text-ink-soft block mb-1">조회수 (선택)</label>
            <input name="views" placeholder="예: 727" defaultValue={editing?.views?.toString() ?? ""} inputMode="numeric" className="w-full border border-line-strong px-3 py-2.5 text-[13.5px] rounded-sm" />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2.5 bg-surface-alt border border-line rounded-sm px-4 py-3">
          <label className="inline-flex items-center gap-2 text-[13px] font-bold cursor-pointer">
            <input type="checkbox" name="isNotice" defaultChecked={isNotice} className="w-4 h-4 accent-red" />
            <span className="text-red">공지</span>
            <span className="font-normal text-ink-faint text-[11.5px]">목록 최상단 고정</span>
          </label>
          <label className="inline-flex items-center gap-2 text-[13px] font-bold cursor-pointer">
            <input type="checkbox" name="published" defaultChecked={editing ? editing.published : true} className="w-4 h-4 accent-blue" />
            <span>공개</span>
            <span className="font-normal text-ink-faint text-[11.5px]">홈페이지에 노출</span>
          </label>
        </div>

        <div>
          <label className="text-[11.5px] font-bold text-ink-soft block mb-1">본문 (선택)</label>
          <textarea
            name="body"
            placeholder="본문 — 줄바꿈이 그대로 표시됩니다. (처음 2줄만 미리보기로 보이고 '전문 보기'로 펼쳐집니다)"
            defaultValue={editing?.body ?? ""}
            rows={6}
            className="w-full border border-line-strong px-3 py-2.5 text-[13.5px] rounded-sm resize-y"
          />
        </div>

        {editing && editingImages.length > 0 && (
          <div>
            <label className="text-[12.5px] font-bold text-ink-soft block mb-1.5">등록된 사진 ({editingImages.length}) — 첫 사진이 목록 썸네일</label>
            <div className="border border-line-strong rounded-sm divide-y divide-line">
              {editingImages.map((img, idx) => (
                <div key={img.id} className="flex items-center gap-3 p-2.5 text-[12.5px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt="" className="w-10 h-10 flex-none object-cover border border-line-strong bg-surface-alt rounded-sm" />
                  {idx === 0 && <span className="flex-none text-[10px] font-bold text-white bg-blue rounded-[4px] px-1.5 py-0.5">대표</span>}
                  <span className="flex-1 min-w-0 truncate">{img.caption || img.url}</span>
                  <form action={deleteNewsImage}>
                    <input type="hidden" name="imageId" value={img.id} />
                    <button type="submit" className="text-red font-bold flex-none">
                      삭제
                    </button>
                  </form>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="text-[12.5px] font-bold text-ink-soft block mb-2">사진 추가 (선택) — 최대 {MAX_IMAGES}장</label>
          <CaseImageStager fieldName="images" remaining={MAX_IMAGES - editingImages.length} />
        </div>

        <div className="flex gap-3">
          <SubmitButton className="justify-self-start px-5 py-2.5 bg-red text-white font-bold text-[13px]">
            {editing ? "저장" : "추가"}
          </SubmitButton>
          {editing && (
            <Link href="/admin/news" className="inline-flex items-center px-5 py-2.5 border border-line-strong text-[13px] font-bold">
              취소
            </Link>
          )}
        </div>
      </form>

      <div className="flex items-center justify-between mb-2.5">
        <h2 className="text-[14px] font-bold">등록된 소식 <span className="text-ink-faint font-mono">({items.length})</span></h2>
      </div>

      <div className="border border-line">
        {items.length === 0 ? (
          <p className="p-4 text-[13px] text-ink-soft">등록된 뉴스가 없습니다.</p>
        ) : (
          items.map((item) => {
            const thumb = imageMap[item.id]?.[0]?.url ?? null;
            const notice = item.postNo === "공지";
            return (
              <div key={item.id} className="flex items-start gap-3.5 p-3.5 border-b border-line last:border-b-0 text-[13px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={thumb ?? "/images/news/logo-thumb.webp"}
                  alt=""
                  className="w-12 h-12 flex-none object-cover border border-line-strong bg-surface-alt rounded-sm mt-0.5"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                    <span className="font-mono text-[10.5px] text-blue border border-line-strong px-1.5 py-0.5">{catLabel(item.tag)}</span>
                    {notice && <span className="text-[10px] font-bold text-white bg-red rounded-[4px] px-1.5 py-0.5">공지</span>}
                    {!notice && item.postNo && <span className="font-mono text-[11px] text-ink-faint">#{item.postNo}</span>}
                    {!item.published && <span className="text-[10px] font-bold text-white bg-ink-faint rounded-[4px] px-1.5 py-0.5">비공개</span>}
                  </div>
                  <p className="font-bold truncate">{item.title}</p>
                  {item.body && <p className="mt-0.5 text-[12px] text-ink-soft line-clamp-2 whitespace-pre-line">{item.body}</p>}
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-ink-faint font-mono">
                    <span>{item.date}</span>
                    {item.views != null && <span>조회 {item.views.toLocaleString()}</span>}
                    {(imageMap[item.id]?.length ?? 0) > 0 && <span className="text-blue font-bold">사진 {imageMap[item.id].length}</span>}
                  </div>
                </div>
                <div className="flex gap-3 flex-none">
                  <Link href={`/admin/news?edit=${item.id}`} className="text-[12px] text-blue font-bold">
                    수정
                  </Link>
                  <form action={deleteNews}>
                    <input type="hidden" name="id" value={item.id} />
                    <button type="submit" className="text-[12px] text-red font-bold">
                      삭제
                    </button>
                  </form>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
