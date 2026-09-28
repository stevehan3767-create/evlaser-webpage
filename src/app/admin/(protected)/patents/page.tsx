import Link from "next/link";
import SubmitButton from "@/components/SubmitButton";
import {
  patentRepo,
  certificationRepo,
  seedPatentsIfEmpty,
  seedCertificationsIfEmpty,
} from "@/lib/repo";
import { patents as patentSeeds, certifications as certificationSeeds } from "@/lib/data";
import FileUploadField from "@/components/FileUploadField";
import {
  savePatent,
  deletePatent,
  saveCertification,
  deleteCertification,
  moveCertification,
} from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminPatentsPage({
  searchParams,
}: {
  searchParams: Promise<{ editPatent?: string; editCert?: string }>;
}) {
  const { editPatent, editCert } = await searchParams;

  await Promise.all([seedPatentsIfEmpty(patentSeeds), seedCertificationsIfEmpty(certificationSeeds)]);
  const [patents, certs] = await Promise.all([patentRepo.list(), certificationRepo.list()]);

  const editingPatent = editPatent ? patents.find((p) => p.id === editPatent) : undefined;
  const editingCert = editCert ? certs.find((c) => c.id === editCert) : undefined;

  return (
    <div>
      <h1 className="text-[22px] font-[family-name:var(--font-display)] tracking-tight mb-2">특허·인증 관리</h1>
      <p className="text-[13px] text-ink-soft mb-8">
        회사소개 → 특허·인증 페이지에 표시됩니다. <b>인증서</b>는 아래 목록의 &quot;위로/아래로&quot; 버튼으로 표시 순서를
        자유롭게 조정할 수 있고, <b>특허</b>는 등록일 기준 최신순으로 자동 정렬됩니다(등록일 미입력 항목은 뒤로 밀립니다).
      </p>

      {/* ===== 인증서 ===== */}
      <section className="mb-12">
        <h2 className="text-[16px] font-bold mb-3">인증서 <span className="font-mono text-ink-faint text-[13px]">({certs.length})</span></h2>

        <form
          key={editingCert?.id ?? "new-cert"}
          action={saveCertification}
          className="border border-line p-5 mb-6 grid gap-3.5 max-w-[560px]"
        >
          <input type="hidden" name="id" value={editingCert?.id ?? ""} />
          <div>
            <label className="text-[12.5px] font-bold text-ink-soft block mb-1.5">인증서명</label>
            <input
              name="title"
              defaultValue={editingCert?.title ?? ""}
              required
              placeholder="예: ISO 9001:2015 품질경영시스템 인증"
              className="w-full border border-line-strong px-3 py-2.5 text-[13.5px] rounded-sm"
            />
          </div>
          <div>
            <label className="text-[12.5px] font-bold text-ink-soft block mb-1.5">부제 (선택)</label>
            <input
              name="subtitle"
              defaultValue={editingCert?.subtitle ?? ""}
              placeholder="예: Quality Management System"
              className="w-full border border-line-strong px-3 py-2.5 text-[13.5px] rounded-sm"
            />
          </div>
          <FileUploadField name="imageUrl" label="인증서 이미지" defaultValue={editingCert?.imageUrl ?? ""} accept="image/*" preview="image" />
          <div className="flex gap-3">
            <SubmitButton className="justify-self-start px-5 py-2.5 bg-red text-white font-bold text-[13px]">
              {editingCert ? "저장" : "추가"}
            </SubmitButton>
            {editingCert && (
              <Link href="/admin/patents" className="inline-flex items-center px-5 py-2.5 border border-line-strong text-[13px] font-bold">
                취소
              </Link>
            )}
          </div>
        </form>

        <div className="border border-line">
          {certs.length === 0 ? (
            <p className="p-4 text-[13px] text-ink-soft">등록된 인증서가 없습니다.</p>
          ) : (
            certs.map((c, i) => (
              <div key={c.id} className="flex items-center justify-between gap-4 p-3.5 border-b border-line last:border-b-0 text-[13px]">
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  <span className="font-mono text-ink-faint w-6 flex-none text-right">{i + 1}</span>
                  <div className="w-[48px] h-[64px] flex-none flex items-center justify-center border border-line-strong bg-white p-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={c.imageUrl} alt={c.title} className="max-w-full max-h-full object-contain" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold truncate">{c.title}</p>
                    {c.subtitle && <p className="text-ink-faint truncate text-[12px]">{c.subtitle}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-none">
                  <form action={moveCertification}>
                    <input type="hidden" name="id" value={c.id} />
                    <input type="hidden" name="direction" value="up" />
                    <button type="submit" disabled={i === 0} className="px-2 py-1 border border-line-strong text-[12px] disabled:opacity-30" aria-label="위로">
                      ▲
                    </button>
                  </form>
                  <form action={moveCertification}>
                    <input type="hidden" name="id" value={c.id} />
                    <input type="hidden" name="direction" value="down" />
                    <button type="submit" disabled={i === certs.length - 1} className="px-2 py-1 border border-line-strong text-[12px] disabled:opacity-30" aria-label="아래로">
                      ▼
                    </button>
                  </form>
                  <Link href={`/admin/patents?editCert=${c.id}`} className="text-[12px] text-blue font-bold">
                    수정
                  </Link>
                  <form action={deleteCertification}>
                    <input type="hidden" name="id" value={c.id} />
                    <button type="submit" className="text-[12px] text-red font-bold">
                      삭제
                    </button>
                  </form>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ===== 특허·상표 ===== */}
      <section>
        <h2 className="text-[16px] font-bold mb-1">특허·상표 <span className="font-mono text-ink-faint text-[13px]">({patents.length})</span></h2>
        <p className="text-[12px] text-ink-faint mb-3">등록일 기준 최신순으로 자동 정렬됩니다. 등록일을 입력하면 순서가 반영됩니다.</p>

        <form
          key={editingPatent?.id ?? "new-patent"}
          action={savePatent}
          className="border border-line p-5 mb-6 grid gap-3.5 max-w-[560px]"
        >
          <input type="hidden" name="id" value={editingPatent?.id ?? ""} />
          <div>
            <label className="text-[12.5px] font-bold text-ink-soft block mb-1.5">특허·상표명</label>
            <input
              name="title"
              defaultValue={editingPatent?.title ?? ""}
              required
              placeholder="예: 레이저 플라스틱 용접시스템"
              className="w-full border border-line-strong px-3 py-2.5 text-[13.5px] rounded-sm"
            />
          </div>
          <div>
            <label className="text-[12.5px] font-bold text-ink-soft block mb-1.5">등록일</label>
            <input
              type="date"
              name="registeredOn"
              defaultValue={editingPatent?.registeredOn ?? ""}
              className="w-full border border-line-strong px-3 py-2.5 text-[13.5px] rounded-sm"
            />
          </div>
          <FileUploadField name="imageUrl" label="특허·상표 이미지" defaultValue={editingPatent?.imageUrl ?? ""} accept="image/*" preview="image" />
          <div className="flex gap-3">
            <SubmitButton className="justify-self-start px-5 py-2.5 bg-red text-white font-bold text-[13px]">
              {editingPatent ? "저장" : "추가"}
            </SubmitButton>
            {editingPatent && (
              <Link href="/admin/patents" className="inline-flex items-center px-5 py-2.5 border border-line-strong text-[13px] font-bold">
                취소
              </Link>
            )}
          </div>
        </form>

        <div className="border border-line">
          {patents.length === 0 ? (
            <p className="p-4 text-[13px] text-ink-soft">등록된 특허가 없습니다.</p>
          ) : (
            patents.map((p, i) => (
              <div key={p.id} className="flex items-center justify-between gap-4 p-3.5 border-b border-line last:border-b-0 text-[13px]">
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  <span className="font-mono text-ink-faint w-6 flex-none text-right">{i + 1}</span>
                  <div className="w-[48px] h-[64px] flex-none flex items-center justify-center border border-line-strong bg-white p-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.imageUrl} alt={p.title} className="max-w-full max-h-full object-contain" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold truncate">{p.title}</p>
                    <p className="text-ink-faint text-[12px] font-mono">{p.registeredOn ?? "등록일 미입력"}</p>
                  </div>
                </div>
                <div className="flex gap-3 flex-none">
                  <Link href={`/admin/patents?editPatent=${p.id}`} className="text-[12px] text-blue font-bold">
                    수정
                  </Link>
                  <form action={deletePatent}>
                    <input type="hidden" name="id" value={p.id} />
                    <button type="submit" className="text-[12px] text-red font-bold">
                      삭제
                    </button>
                  </form>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
