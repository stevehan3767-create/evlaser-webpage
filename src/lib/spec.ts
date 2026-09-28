// 표준 사양서 표("항목 | 값" 여러 줄)를 파싱/필터링하는 공용 유틸.
// 인쇄용 사양서 페이지와 제품 상세페이지의 "주요 사양" 표가 동일한 규칙을 쓴다.

export interface SpecRow {
  k: string;
  v: string;
}

// "항목 | 값" 한 줄을 {k, v}로. 값에 |가 포함될 수 있어 첫 |만 기준으로 분리.
export function parseSpecRows(text: string | null | undefined): SpecRow[] {
  if (!text) return [];
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    // 마크다운 표 구분선(|---|---|)이 섞여 들어와도 무시
    .filter((line) => !/^\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?$/.test(line))
    .map((line) => {
      // 마크다운 표 형식(| 항목 | 값 |)도 허용: 양끝 | 제거 후 첫 | 기준 분리
      const clean = line.replace(/^\|/, "").replace(/\|$/, "");
      const i = clean.indexOf("|");
      if (i === -1) return { k: clean.trim(), v: "" };
      return { k: clean.slice(0, i).trim(), v: clean.slice(i + 1).trim() };
    })
    .filter((r) => r.k.length > 0);
}

// 값이 비어 있거나 대시(---, —)만 있는 행은 제외한 "실제 입력된" 행만 반환.
export function filledSpecRows(text: string | null | undefined): SpecRow[] {
  return parseSpecRows(text).filter((r) => r.v !== "" && !/^[-–—·・\s]+$/.test(r.v));
}

// 내용(description) 안의 "[사양]" 표 구간을 뽑아 값이 있는 행만 반환.
// 표준 사양서 폼이 비어 있을 때의 폴백(레거시 데이터)으로 사용한다.
export function specRowsFromDescription(desc: string | null | undefined): SpecRow[] {
  if (!desc) return [];
  const lines = desc.replace(/\r\n/g, "\n").split("\n");
  const idx = lines.findIndex((l) => {
    const t = l.replace(/\s/g, "");
    return t === "[사양]" || t === "[사양·Specifications]" || t === "[Specifications]";
  });
  if (idx === -1) return [];
  const tableLines: string[] = [];
  for (let i = idx + 1; i < lines.length; i++) {
    const t = lines[i].trim();
    if (t === "") continue;
    if (!t.startsWith("|")) break;
    tableLines.push(t);
  }
  return filledSpecRows(tableLines.join("\n")).filter(
    (r) => r.k !== "항목" && r.k.toLowerCase() !== "item"
  );
}

// 사양 표의 최종 출처를 결정한다: 표준 사양서 폼에 입력된 값이 있으면 그것을,
// 없으면 내용의 [사양] 표(레거시)를 사용한다.
export function resolveSpecRows(
  specTable: string | null | undefined,
  description: string | null | undefined
): SpecRow[] {
  const primary = filledSpecRows(specTable);
  if (primary.length > 0) return primary;
  return specRowsFromDescription(description);
}
