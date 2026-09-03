import Link from "next/link";
import { officeSeeds } from "@/lib/data";
import { officeRepo, distributorRepo, seedOfficesIfEmpty } from "@/lib/repo";
import { listCountryOptions, countryFlag, countryName, isCountryCode } from "@/lib/countries";
import { saveOffice, deleteOffice, saveDistributor, deleteDistributor } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminGlobalPage({
  searchParams,
}: {
  searchParams: Promise<{ editOffice?: string; editDistributor?: string }>;
}) {
  const { editOffice, editDistributor } = await searchParams;

  await seedOfficesIfEmpty(officeSeeds);
  const [offices, distributors] = await Promise.all([officeRepo.list(), distributorRepo.list()]);

  const officeBeingEdited = editOffice ? offices.find((o) => o.id === editOffice) : undefined;
  const distributorBeingEdited = editDistributor ? distributors.find((d) => d.id === editDistributor) : undefined;
  const countryOptions = listCountryOptions();

  return (
    <div>
      <h1 className="text-[22px] font-[family-name:var(--font-display)] tracking-tight mb-8">글로벌 네트워크 관리</h1>

      <h2 className="text-[15px] font-bold mb-3">지사·연락처{officeBeingEdited && " — 수정"}</h2>
      <form action={saveOffice} className="border border-line p-5 mb-8 grid gap-3.5">
        <input type="hidden" name="id" value={officeBeingEdited?.id ?? ""} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <input
            name="name"
            placeholder="지사명 (예: 본사)"
            defaultValue={officeBeingEdited?.name ?? ""}
            required
            className="border border-line-strong px-3 py-2.5 text-[13.5px] rounded-sm"
          />
          <input
            name="address"
            placeholder="주소"
            defaultValue={officeBeingEdited?.address ?? ""}
            required
            className="border border-line-strong px-3 py-2.5 text-[13.5px] rounded-sm"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <input
            name="phone"
            placeholder="전화 (선택)"
            defaultValue={officeBeingEdited?.phone ?? ""}
            className="border border-line-strong px-3 py-2.5 text-[13.5px] rounded-sm"
          />
          <input
            name="email"
            placeholder="이메일 (선택)"
            defaultValue={officeBeingEdited?.email ?? ""}
            className="border border-line-strong px-3 py-2.5 text-[13.5px] rounded-sm"
          />
        </div>
        <div className="flex gap-3">
          <button type="submit" className="justify-self-start px-5 py-2.5 bg-red text-white font-bold text-[13px]">
            {officeBeingEdited ? "저장" : "추가"}
          </button>
          {officeBeingEdited && (
            <Link href="/admin/global" className="inline-flex items-center px-5 py-2.5 border border-line-strong text-[13px] font-bold">
              취소
            </Link>
          )}
        </div>
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
              <div className="flex gap-3 flex-none">
                <Link href={`/admin/global?editOffice=${o.id}`} className="text-[12px] text-blue font-bold">
                  수정
                </Link>
                <form action={deleteOffice}>
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

      <h2 className="text-[15px] font-bold mb-3">대리점 찾기{distributorBeingEdited && " — 수정"}</h2>
      <form action={saveDistributor} className="border border-line p-5 mb-8 grid gap-3.5">
        <input type="hidden" name="id" value={distributorBeingEdited?.id ?? ""} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <select
            name="country"
            defaultValue={distributorBeingEdited?.country ?? ""}
            required
            className="border border-line-strong px-3 py-2.5 text-[13.5px] rounded-sm bg-surface"
          >
            <option value="" disabled>
              국가 선택
            </option>
            {countryOptions.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
          <input
            name="partner"
            placeholder="파트너사명"
            defaultValue={distributorBeingEdited?.partner ?? ""}
            required
            className="border border-line-strong px-3 py-2.5 text-[13.5px] rounded-sm"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <input
            name="contact"
            placeholder="담당자 (선택)"
            defaultValue={distributorBeingEdited?.contact ?? ""}
            className="border border-line-strong px-3 py-2.5 text-[13.5px] rounded-sm"
          />
          <input
            name="phone"
            placeholder="전화 (선택)"
            defaultValue={distributorBeingEdited?.phone ?? ""}
            className="border border-line-strong px-3 py-2.5 text-[13.5px] rounded-sm"
          />
        </div>
        <div className="flex gap-3">
          <button type="submit" className="justify-self-start px-5 py-2.5 bg-red text-white font-bold text-[13px]">
            {distributorBeingEdited ? "저장" : "추가"}
          </button>
          {distributorBeingEdited && (
            <Link href="/admin/global" className="inline-flex items-center px-5 py-2.5 border border-line-strong text-[13px] font-bold">
              취소
            </Link>
          )}
        </div>
      </form>

      <div className="border border-line">
        {distributors.length === 0 ? (
          <p className="p-4 text-[13px] text-ink-soft">등록된 대리점이 없습니다.</p>
        ) : (
          distributors.map((d) => (
            <div key={d.id} className="flex items-start justify-between gap-4 p-3.5 border-b border-line last:border-b-0 text-[13px]">
              <div className="flex-1">
                <p className="font-bold">
                  {isCountryCode(d.country) ? `${countryFlag(d.country)} ${countryName(d.country)}` : d.country} · {d.partner}
                </p>
                <p className="mt-1 text-[11.5px] text-ink-faint">
                  {d.contact && <span>{d.contact}</span>}
                  {d.contact && d.phone && <span> · </span>}
                  {d.phone && <span>{d.phone}</span>}
                </p>
              </div>
              <div className="flex gap-3 flex-none">
                <Link href={`/admin/global?editDistributor=${d.id}`} className="text-[12px] text-blue font-bold">
                  수정
                </Link>
                <form action={deleteDistributor}>
                  <input type="hidden" name="id" value={d.id} />
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
