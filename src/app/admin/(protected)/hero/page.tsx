import Link from "next/link";
import { heroSlideRepo } from "@/lib/repo";
import { saveHeroSlide, deleteHeroSlide } from "./actions";
import FileUploadField from "@/components/FileUploadField";

export const dynamic = "force-dynamic";

const MAX_SLIDES = 5;

export default async function AdminHeroPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const { edit } = await searchParams;
  const slides = await heroSlideRepo.list();
  const editing = edit ? slides.find((s) => s.id === edit) : undefined;

  return (
    <div>
      <h1 className="text-[22px] font-[family-name:var(--font-display)] tracking-tight mb-2">메인화면 대표이미지 관리</h1>
      <p className="text-[13px] text-ink-soft mb-6">
        홈페이지 상단에 순서대로 롤링되는 대표이미지입니다. 최대 {MAX_SLIDES}개까지 등록할 수 있습니다.
      </p>

      {!editing && slides.length >= MAX_SLIDES ? (
        <p className="border border-line p-5 mb-8 text-[13px] text-ink-soft">
          대표이미지는 최대 {MAX_SLIDES}개까지 등록할 수 있습니다. 새로 추가하려면 기존 항목을 먼저 삭제해 주세요.
        </p>
      ) : (
        <form
          key={editing?.id ?? "new"}
          action={saveHeroSlide}
          className="border border-line p-5 mb-8 grid gap-3.5 max-w-[560px]"
        >
          <input type="hidden" name="id" value={editing?.id ?? ""} />
          <FileUploadField
            name="imageUrl"
            label="이미지"
            defaultValue={editing?.imageUrl ?? ""}
            accept="image/*"
            preview="image"
          />
          <div>
            <label className="text-[12.5px] font-bold text-ink-soft block mb-1.5">제목</label>
            <input
              name="title"
              defaultValue={editing?.title ?? ""}
              required
              className="w-full border border-line-strong px-3 py-2.5 text-[13.5px] rounded-sm"
            />
          </div>
          <div className="flex gap-3">
            <button type="submit" className="justify-self-start px-5 py-2.5 bg-red text-white font-bold text-[13px]">
              {editing ? "저장" : "추가"}
            </button>
            {editing && (
              <Link href="/admin/hero" className="inline-flex items-center px-5 py-2.5 border border-line-strong text-[13px] font-bold">
                취소
              </Link>
            )}
          </div>
        </form>
      )}

      <div className="border border-line">
        {slides.length === 0 ? (
          <p className="p-4 text-[13px] text-ink-soft">등록된 대표이미지가 없습니다. 등록 전까지는 기본 이미지가 표시됩니다.</p>
        ) : (
          slides.map((s, i) => (
            <div key={s.id} className="flex items-start justify-between gap-4 p-3.5 border-b border-line last:border-b-0 text-[13px]">
              <div className="flex-1">
                <p className="font-bold">
                  {i + 1}. {s.title}
                </p>
                <p className="mt-1 text-[11.5px] text-ink-faint break-all">{s.imageUrl}</p>
              </div>
              <div className="flex gap-3 flex-none">
                <Link href={`/admin/hero?edit=${s.id}`} className="text-[12px] text-blue font-bold">
                  수정
                </Link>
                <form action={deleteHeroSlide}>
                  <input type="hidden" name="id" value={s.id} />
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
