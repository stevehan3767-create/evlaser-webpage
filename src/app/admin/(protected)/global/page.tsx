import { officeSeeds } from "@/lib/data";
import { officeRepo, distributorRepo, seedOfficesIfEmpty } from "@/lib/repo";
import { createOffice, deleteOffice, createDistributor, deleteDistributor } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminGlobalPage() {
  await seedOfficesIfEmpty(officeSeeds);
  const [offices, distributors] = await Promise.all([officeRepo.list(), distributorRepo.list()]);

  return (
    <div>
      <h1 className="text-[22px] font-[family-name:var(--font-display)] tracking-tight mb-2">글로벌 네트워크 관리</h1>
      <p className="text-[13px] text-ink-soft mb-8">
        내용을 수정하려면 기존 항목을 삭제한 뒤 새로 추가해 주세요.
      </p>

      <h2 className="text-[15px] font-bold mb-3">지사·연락처</h2>
      <form action={createOffice} className="border border-line p-5 mb-8 grid gap-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <input name="name" placeholder="지사명 (예: 본사)" required className="border border-line-strong px-3 py-2.5 text-[13.5px] rounded-sm" />
          <input name="address" placeholder="주소" required className="border border-line-strong px-3 py-2.5 text-[13.5px] rounded-sm" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <input name="phone" placeholder="전화 (선택)" className="border border-line-strong px-3 py-2.5 text-[13.5px] rounded-sm" />
          <input name="email" placeholder="이메일 (선택)" className="border border-line-strong px-3 py-2.5 text-[13.5px] rounded-sm" />
        </div>
        <button type="submit" className="justify-self-start px-5 py-2.5 bg-red text-white font-bold text-[13px]">
          추가
        </button>
      </form>

      <div className="border border-line mb-12">
        {offices.length === 0 ? (
          <p className="p-4 text-[13px] text-ink-soft">등록된 지사가 없습니다.</p>
        ) : (
          offices.map((o) => (
            <div key={o.id} className="flex items-start justify-between gap-4 p-3.5 border-b border-line last:border-b-0 text-[13px]">
              <div className="flex-1">
                <p className="font-bold">{o.name}</p>
                <p className="mt-1 text-[12px] text-ink-soft">{o.address}</p>
                <p className="mt-1 text-[11.5px] text-ink-faint">
                  {o.phone && <span>{o.phone}</span>}
                  {o.phone && o.email && <span> · </span>}
                  {o.email && <span>{o.email}</span>}
                </p>
              </div>
              <form action={deleteOffice}>
                <input type="hidden" name="id" value={o.id} />
                <button type="submit" className="text-[12px] text-red font-bold flex-none">
                  삭제
                </button>
              </form>
            </div>
          ))
        )}
      </div>

      <h2 className="text-[15px] font-bold mb-3">대리점 찾기</h2>
      <form action={createDistributor} className="border border-line p-5 mb-8 grid gap-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <input name="country" placeholder="국가" required className="border border-line-strong px-3 py-2.5 text-[13.5px] rounded-sm" />
          <input name="partner" placeholder="파트너사명" required className="border border-line-strong px-3 py-2.5 text-[13.5px] rounded-sm" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <input name="contact" placeholder="담당자 (선택)" className="border border-line-strong px-3 py-2.5 text-[13.5px] rounded-sm" />
          <input name="phone" placeholder="전화 (선택)" className="border border-line-strong px-3 py-2.5 text-[13.5px] rounded-sm" />
        </div>
        <button type="submit" className="justify-self-start px-5 py-2.5 bg-red text-white font-bold text-[13px]">
          추가
        </button>
      </form>

      <div className="border border-line">
        {distributors.length === 0 ? (
          <p className="p-4 text-[13px] text-ink-soft">등록된 대리점이 없습니다.</p>
        ) : (
          distributors.map((d) => (
            <div key={d.id} className="flex items-start justify-between gap-4 p-3.5 border-b border-line last:border-b-0 text-[13px]">
              <div className="flex-1">
                <p className="font-bold">
                  {d.country} · {d.partner}
                </p>
                <p className="mt-1 text-[11.5px] text-ink-faint">
                  {d.contact && <span>{d.contact}</span>}
                  {d.contact && d.phone && <span> · </span>}
                  {d.phone && <span>{d.phone}</span>}
                </p>
              </div>
              <form action={deleteDistributor}>
                <input type="hidden" name="id" value={d.id} />
                <button type="submit" className="text-[12px] text-red font-bold flex-none">
                  삭제
                </button>
              </form>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
