import Link from "next/link";
import SubmitButton from "@/components/SubmitButton";
import { clientLogoRepo, seedClientLogosIfEmpty } from "@/lib/repo";
import { defaultClientNames } from "@/lib/data";
import { saveClientLogo, deleteClientLogo, moveClientLogo } from "./actions";
import FileUploadField from "@/components/FileUploadField";

export const dynamic = "force-dynamic";

export default async function AdminClientsPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const { edit } = await searchParams;
  await seedClientLogosIfEmpty(defaultClientNames);
  const logos = await clientLogoRepo.list();
  const editing = edit ? logos.find((l) => l.id === edit) : undefined;

  // ── 중복 탐지 ──────────────────────────────────────────────
  // ① 회사명 중복(공백·괄호·㈜ 등 기호를 무시한 정규화 기준)
  // ② 로고 이미지 중복(완전히 동일한 이미지 주소/데이터를 사용하는 경우)
  const normName = (s: string) => (s || "").replace(/[^0-9a-z가-힣]/gi, "").toLowerCase();
  const nameGroups = new Map<string, typeof logos>();
  const urlGroups = new Map<string, typeof logos>();
  for (const l of logos) {
    const nk = normName(l.name);
    if (nk) nameGroups.set(nk, [...(nameGroups.get(nk) ?? []), l]);
    const uk = (l.logoUrl || "").trim();
    if (uk) urlGroups.set(uk, [...(urlGroups.get(uk) ?? []), l]);
  }
  const dupNameGroups = [...nameGroups.values()].filter((g) => g.length > 1);
  const dupUrlGroups = [...urlGroups.values()].filter((g) => g.length > 1);
  const dupIds = new Set<string>();
  dupNameGroups.forEach((g) => g.forEach((l) => dupIds.add(l.id)));
  dupUrlGroups.forEach((g) => g.forEach((l) => dupIds.add(l.id)));

  return (
    <div>
      <h1 className="text-[22px] font-[family-name:var(--font-display)] tracking-tight mb-2">주요 고객사 로고 관리</h1>
      <p className="text-[13px] text-ink-soft mb-6">
        회사소개 페이지의 &quot;주요 고객사&quot; 섹션(회사소개 메뉴 → 주요 고객사)에 표시되는 로고입니다. 아래 목록에 보이는 순서대로
        노출되며, 각 항목의 <b>▲(앞으로) / ▼(뒤로)</b> 버튼으로 표시 순서를 자유롭게 조정할 수 있습니다. 로고 이미지는 화면에서
        동일한 크기 박스 안에 비율을 유지한 채 자동으로 맞춰집니다. 가급적 배경이 투명하거나 흰색인 고해상도 이미지를 등록해 주세요.
        <br />
        아래 목록은 기존 고객사 명단을 기준으로 임시 등록된 항목이며, 회색 placeholder 로고로 표시된 항목은 아직 실제
        로고 파일이 등록되지 않은 상태입니다. &quot;수정&quot;을 눌러 실제 로고 이미지로 교체해 주세요.
      </p>

      {/* 중복 의심 항목 리포트 */}
      {dupNameGroups.length + dupUrlGroups.length > 0 ? (
        <div className="border border-red bg-red-soft/50 rounded-sm p-4 mb-8">
          <p className="font-bold text-[14px] text-red mb-2">
            ⚠ 중복 의심 항목 — 회사명 {dupNameGroups.length}건 · 로고 이미지 {dupUrlGroups.length}건
          </p>
          {dupNameGroups.length > 0 && (
            <div className="mb-3">
              <p className="text-[12.5px] font-bold text-ink-soft mb-1.5">회사명이 겹치는 그룹</p>
              <ul className="flex flex-col gap-1.5">
                {dupNameGroups.map((g, gi) => (
                  <li key={`n${gi}`} className="text-[12.5px] text-ink flex flex-wrap items-center gap-x-1.5 gap-y-1">
                    <span className="font-bold">{g.length}개:</span>
                    {g.map((l, li) => (
                      <span key={l.id} className="inline-flex items-center">
                        {li > 0 && <span className="text-ink-faint mr-1.5">·</span>}
                        <Link href={`/admin/clients?edit=${l.id}`} className="text-blue underline underline-offset-2">
                          {l.name}
                        </Link>
                      </span>
                    ))}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {dupUrlGroups.length > 0 && (
            <div>
              <p className="text-[12.5px] font-bold text-ink-soft mb-1.5">로고 이미지(주소)가 동일한 그룹</p>
              <ul className="flex flex-col gap-1.5">
                {dupUrlGroups.map((g, gi) => (
                  <li key={`u${gi}`} className="text-[12.5px] text-ink flex flex-wrap items-center gap-x-1.5 gap-y-1">
                    <span className="font-bold">{g.length}개:</span>
                    {g.map((l, li) => (
                      <span key={l.id} className="inline-flex items-center">
                        {li > 0 && <span className="text-ink-faint mr-1.5">·</span>}
                        <Link href={`/admin/clients?edit=${l.id}`} className="text-blue underline underline-offset-2">
                          {l.name}
                        </Link>
                      </span>
                    ))}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <p className="text-[11.5px] text-ink-faint mt-3">
            겹치는 항목 중 불필요한 쪽을 &quot;삭제&quot;하거나 &quot;수정&quot;으로 정리해 주세요. 아래 목록에서도 중복 항목에 빨간 &quot;중복&quot; 표시가 붙습니다.
          </p>
        </div>
      ) : (
        <p className="text-[12.5px] text-ink-faint mb-8">✓ 회사명·로고 이미지가 겹치는 중복 항목이 발견되지 않았습니다.</p>
      )}

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
          <SubmitButton className="justify-self-start px-5 py-2.5 bg-red text-white font-bold text-[13px]">
            {editing ? "저장" : "추가"}
          </SubmitButton>
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
          logos.map((l, i) => (
            <div key={l.id} className="flex items-center justify-between gap-4 p-3.5 border-b border-line last:border-b-0 text-[13px]">
              <div className="flex items-center gap-3.5 flex-1 min-w-0">
                <span className="w-7 flex-none text-center font-mono text-[12px] text-ink-faint">{i + 1}</span>
                <div className="w-[84px] h-[48px] flex-none flex items-center justify-center border border-line-strong bg-white p-1.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={l.logoUrl} alt={l.name} className="max-w-full max-h-full object-contain" />
                </div>
                <p className="font-bold truncate">{l.name}</p>
                {dupIds.has(l.id) && (
                  <span className="flex-none font-mono text-[10px] font-bold text-white bg-red rounded-sm px-1.5 py-0.5">중복</span>
                )}
              </div>
              <div className="flex items-center gap-3 flex-none">
                <div className="flex gap-1">
                  <form action={moveClientLogo}>
                    <input type="hidden" name="id" value={l.id} />
                    <input type="hidden" name="direction" value="up" />
                    <button type="submit" disabled={i === 0} className="px-2 py-1 border border-line-strong text-[12px] disabled:opacity-30" aria-label="앞으로">
                      ▲
                    </button>
                  </form>
                  <form action={moveClientLogo}>
                    <input type="hidden" name="id" value={l.id} />
                    <input type="hidden" name="direction" value="down" />
                    <button type="submit" disabled={i === logos.length - 1} className="px-2 py-1 border border-line-strong text-[12px] disabled:opacity-30" aria-label="뒤로">
                      ▼
                    </button>
                  </form>
                </div>
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
