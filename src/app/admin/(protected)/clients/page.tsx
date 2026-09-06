import Link from "next/link";
import { clientLogoRepo, seedClientLogosIfEmpty } from "@/lib/repo";
import { defaultClientNames } from "@/lib/data";
import { saveClientLogo, deleteClientLogo } from "./actions";
import FileUploadField from "@/components/FileUploadField";

export const dynamic = "force-dynamic";

export default async function AdminClientsPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const { edit } = await searchParams;
  await seedClientLogosIfEmpty(defaultClientNames);
  const logos = await clientLogoRepo.list();
  const editing = edit ? logos.find((l) => l.id === edit) : undefined;

  return (
    <div>
      <h1 className="text-[22px] font-[family-name:var(--font-display)] tracking-tight mb-2">주요 고객사 로고 관리</h1>
      <p className="text-[13px] text-ink-soft mb-6">
        회사소개 페이지의 &quot;주요 고객사&quot; 섹션(회사소개 메뉴 → 주요 고객사)에 표시되는 로고입니다. 등록된 순서대로
        노출되며, 로고 이미지는 화면에서 동일한 크기 박스 안에
        비율을 유지한 채 자동으로 맞춰집니다. 가급적 배경이 투명하거나 흰색인 고해상도 이미지를 등록해 주세요.
        <br />
        아래 목록은 기존 고객사 명단을 기준으로 임시 등록된 항목이며, 회색 placeholder 로고로 표시된 항목은 아직 실제
        로고 파일이 등록되지 않은 상태입니다. &quot;수정&quot;을 눌러 실제 로고 이미지로 교체해 주세요.
      </p>

      <form
        key={editing?.id ?? "new"}
        action={saveClientLogo}
        className="border border-line p-5 mb-8 grid gap-3.5 max-w-[560px]"
      >
        <input type="hidden" name="id" value={editing?.id ?? ""} />
        <div>
          <label className="text-[12.5px] font-bold text-ink-soft block mb-1.5">회사명</label>
          <input
            name="name"
            defaultValue={editing?.name ?? ""}
            required
            placeholder="예: HYUNDAI"
            className="w-full border border-line-strong px-3 py-2.5 text-[13.5px] rounded-sm"
          />
        </div>
        <FileUploadField name="logoUrl" label="로고 이미지" defaultValue={editing?.logoUrl ?? ""} accept="image/*" preview="image" />
        <div className="flex gap-3">
          <button type="submit" className="justify-self-start px-5 py-2.5 bg-red text-white font-bold text-[13px]">
            {editing ? "저장" : "추가"}
          </button>
          {editing && (
            <Link href="/admin/clients" className="inline-flex items-center px-5 py-2.5 border border-line-strong text-[13px] font-bold">
              취소
            </Link>
          )}
        </div>
      </form>

      <div className="border border-line">
        {logos.length === 0 ? (
          <p className="p-4 text-[13px] text-ink-soft">등록된 고객사 로고가 없습니다.</p>
        ) : (
          logos.map((l) => (
            <div key={l.id} className="flex items-center justify-between gap-4 p-3.5 border-b border-line last:border-b-0 text-[13px]">
              <div className="flex items-center gap-3.5 flex-1 min-w-0">
                <div className="w-[84px] h-[48px] flex-none flex items-center justify-center border border-line-strong bg-white p-1.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={l.logoUrl} alt={l.name} className="max-w-full max-h-full object-contain" />
                </div>
                <p className="font-bold truncate">{l.name}</p>
              </div>
              <div className="flex gap-3 flex-none">
                <Link href={`/admin/clients?edit=${l.id}`} className="text-[12px] text-blue font-bold">
                  수정
                </Link>
                <form action={deleteClientLogo}>
                  <input type="hidden" name="id" value={l.id} />
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
