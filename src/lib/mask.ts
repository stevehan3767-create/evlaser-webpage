// 작성자 이름 마스킹: 첫·끝 글자만 남기고 가운데는 * (예: 홍길동 → 홍*동, 홍길동전 → 홍**전).
// 이름 뒤 직책(공백 뒤)은 그대로 두고, 영문명은 첫·끝 알파벳만 남긴다.
export function maskName(raw: string): string {
  const trimmed = (raw || "").trim();
  if (!trimmed) return "비공개";
  const parts = trimmed.split(/\s+/);
  const name = parts[0];
  const rest = parts.slice(1).join(" ");
  let masked: string;
  if (!/[가-힣]/.test(name)) {
    const a = name.replace(/[^A-Za-z]/g, "");
    masked = a.length <= 1 ? "비공개" : a[0] + "***" + a[a.length - 1];
    return masked; // 영문명은 직책 토큰도 이름일 가능성이 높아 첫 토큰만 노출
  }
  if (name.includes("*")) masked = name;
  else if (name.length <= 1) masked = name;
  else if (name.length === 2) masked = name[0] + "*";
  else masked = name[0] + "*".repeat(name.length - 2) + name[name.length - 1];
  return rest ? `${masked} ${rest}` : masked;
}

// 폼에는 제목 칸이 없으므로 문의 내용(또는 구분)에서 간단한 제목을 만든다.
export function deriveInquiryTitle(message: string | null | undefined, industry: string | null | undefined): string {
  const clean = (message || "").replace(/\s+/g, " ").trim();
  if (clean) return clean.length > 40 ? clean.slice(0, 40) + "…" : clean;
  return (industry || "문의").trim();
}
