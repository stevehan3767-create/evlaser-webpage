import { notFound } from "next/navigation";
import { contentGroups, standardSpecTable } from "@/lib/data";
import { contentPageRepo, contentImageRepo, contentItemRepo, seedContentItemsIfEmpty } from "@/lib/repo";
import PrintButton from "@/components/PrintButton";

export const dynamic = "force-dynamic";

// "항목 | 값" 여러 줄을 [항목, 값] 배열로. 값에 |가 있을 수 있으니 첫 |만 분리.
function parseSpecRows(text: string | null): { k: string; v: string }[] {
  if (!text) return [];
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const i = line.indexOf("|");
      if (i === -1) return { k: line, v: "" };
      return { k: line.slice(0, i).trim(), v: line.slice(i + 1).trim() };
    });
}

export default async function SpecSheetPage({
  params,
}: {
  params: Promise<{ group: string; key: string }>;
}) {
  const { group, key } = await params;
  const meta = contentGroups[group];
  if (!meta) notFound();

  await seedContentItemsIfEmpty(group, meta.itemSeeds);
  const items = await contentItemRepo.listByGroup(group);
  const item = items.find((i) => i.itemKey === key);
  if (!item) notFound();

  const [page, images] = await Promise.all([
    contentPageRepo.get(group, key),
    contentImageRepo.listByKey(group, key),
  ]);

  const title = page?.title || item.name;
  // 사양 표 미입력 시에도 표준 항목 골격을 공란으로 표시한다.
  const rows = parseSpecRows(page?.specTable && page.specTable.trim() ? page.specTable : standardSpecTable);
  const samples = images.slice(0, 3);
  const isOem = page?.isOem ?? false;

  return (
    <div className="spec-root">
      <div className="toolbar">
        <PrintButton />
      </div>

      <div className="sheet">
        <header>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="logo" src="/images/logo.png" alt="EVLASER" />
          <div className="doc-tag">
            {isOem && <span className="badge">해외 OEM 생산 · Overseas OEM</span>}
            <div className="t">제품 사양서 · PRODUCT SPECIFICATION</div>
          </div>
        </header>

        <div className="title-block">
          <div className="eyebrow">EQUIPMENT SPECIFICATION</div>
          <h1>{title}</h1>
          {page?.nameEn && <div className="en">{page.nameEn}</div>}
          {page?.model && <div className="model">모델명(Model): {page.model}</div>}
        </div>

        <h2 className="sec">설비 이미지 · Equipment Image</h2>
        <div className="equip">
          {page?.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={page.imageUrl} alt={title} />
          ) : (
            <div className="ph">설비 이미지 없음 · No image</div>
          )}
        </div>

        <h2 className="sec">주요 사양 · Specifications</h2>
        {rows.length > 0 ? (
          <table>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td className="k">{r.k}</td>
                  <td className="v">{r.v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="empty">등록된 사양이 없습니다. (관리자에서 &quot;사양 표&quot;를 입력하세요)</p>
        )}

        <h2 className="sec">적용사례 · Application Samples</h2>
        <div className="samples">
          {[0, 1, 2].map((i) => {
            const s = samples[i];
            return (
              <figure key={i} className="sample">
                <div className="slot">
                  {s ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={s.url} alt={s.caption ?? ""} />
                  ) : (
                    <span className="ph">샘플 {i + 1}</span>
                  )}
                </div>
                <figcaption>{s?.caption ?? ""}</figcaption>
              </figure>
            );
          })}
        </div>

        <p className="note">
          {isOem
            ? "※ 본 사양은 해외 OEM 파트너 제공 자료를 기준으로 하며 구성·옵션에 따라 변경될 수 있습니다. 정확한 사양은 ㈜이브이레이저로 문의하시기 바랍니다."
            : "※ 본 사양은 제품 개선을 위해 사전 통보 없이 변경될 수 있습니다. 정확한 사양은 ㈜이브이레이저로 문의하시기 바랍니다."}
          <br />
          {isOem
            ? "※ Specifications are based on overseas OEM partner data and may vary by configuration. Contact EVLASER for confirmed specifications."
            : "※ Specifications may change without prior notice for product improvement. Contact EVLASER for confirmed specifications."}
          {isOem && page?.oemSource && (
            <>
              <br />
              <span className="src">출처(Source): {page.oemSource}</span>
            </>
          )}
        </p>

        <footer>
          <div className="co">㈜이브이레이저 · EVLASER CO., LTD.</div>
          본사 (Head Office): 경기도 군포시 고산로 148번길 17 군포IT밸리 B동 313호 (15850)
          <br />
          Tel: +82-31-452-9860 &nbsp;|&nbsp; Email: info@evlaser.co.kr &nbsp;|&nbsp; Web: www.evlaser.co.kr
        </footer>
      </div>

      <style>{`
        .spec-root { background:#eee; min-height:100vh; font-family:"Malgun Gothic","맑은 고딕","Apple SD Gothic Neo","Noto Sans KR",sans-serif; color:#1a1a1a; }
        .spec-root .toolbar { text-align:center; padding:14px; }
        .spec-root .print-btn { font-size:14px; font-weight:700; padding:10px 22px; border:0; border-radius:4px; background:#E30613; color:#fff; cursor:pointer; }
        .spec-root .sheet { width:210mm; min-height:297mm; margin:0 auto 24px; background:#fff; padding:15mm 15mm 14mm; display:flex; flex-direction:column; box-shadow:0 2px 14px rgba(0,0,0,.15); }
        .spec-root header { display:flex; justify-content:space-between; align-items:center; border-bottom:3px solid #E30613; padding-bottom:12px; }
        .spec-root header .logo { height:46px; width:auto; }
        .spec-root .doc-tag { text-align:right; }
        .spec-root .badge { display:inline-block; background:#fff3f3; color:#E30613; border:1.5px solid #E30613; border-radius:4px; padding:4px 11px; font-size:12px; font-weight:800; }
        .spec-root .doc-tag .t { margin-top:7px; font-size:11px; color:#555; letter-spacing:1px; }
        .spec-root .title-block { margin:18px 0 12px; }
        .spec-root .eyebrow { font-size:11px; letter-spacing:3px; color:#E30613; font-weight:800; }
        .spec-root h1 { font-size:23px; margin:6px 0 3px; color:#111; }
        .spec-root .en { font-size:13px; color:#555; font-weight:600; }
        .spec-root .model { font-size:12.5px; color:#555; margin-top:4px; }
        .spec-root h2.sec { font-size:13px; letter-spacing:.5px; color:#fff; background:#111; padding:8px 13px; margin:16px 0 0; }
        .spec-root .equip { margin-top:10px; border:1px solid #d0d0d0; border-radius:4px; height:56mm; display:flex; align-items:center; justify-content:center; overflow:hidden; background:#fafafa; }
        .spec-root .equip img { width:100%; height:100%; object-fit:contain; }
        .spec-root .ph { color:#9a9a9a; font-size:12px; font-weight:700; }
        .spec-root table { width:100%; border-collapse:collapse; margin-top:0; font-size:13px; }
        .spec-root td { border:1px solid #d0d0d0; padding:8px 13px; vertical-align:top; }
        .spec-root td.k { width:38%; background:#f7f7f7; font-weight:700; color:#111; }
        .spec-root .empty { font-size:12px; color:#999; padding:10px 2px; }
        .spec-root .samples { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; margin-top:10px; }
        .spec-root .sample .slot { height:28mm; border:1px solid #d0d0d0; border-radius:4px; background:#fafafa; display:flex; align-items:center; justify-content:center; overflow:hidden; }
        .spec-root .sample .slot img { width:100%; height:100%; object-fit:contain; }
        .spec-root .sample figcaption { margin-top:5px; font-size:11.5px; color:#333; text-align:center; font-weight:600; }
        .spec-root .note { margin:12px 0 14px; font-size:11px; color:#555; line-height:1.6; }
        .spec-root .note .src { word-break:break-all; }
        .spec-root footer { margin-top:auto; border-top:1px solid #d0d0d0; padding-top:10px; font-size:11px; color:#555; line-height:1.7; }
        .spec-root footer .co { font-weight:800; color:#111; font-size:12.5px; margin-bottom:2px; }
        @media print {
          @page { size:A4; margin:0; }
          .spec-root { background:#fff; }
          .spec-root .toolbar { display:none; }
          .spec-root .sheet { box-shadow:none; margin:0; width:auto; min-height:auto; }
        }
      `}</style>
    </div>
  );
}
