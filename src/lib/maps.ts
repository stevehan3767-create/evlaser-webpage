import type { MapProvider } from "./repo";

// Plain search-by-query deep links — no API key needed, work for any address.
export function mapSearchUrl(provider: MapProvider, query: string): string {
  const q = encodeURIComponent(query);
  return provider === "google" ? `https://www.google.com/maps/search/?api=1&query=${q}` : `https://map.naver.com/p/search/${q}`;
}

// 카카오(다음) 약도 "퍼가기" 키 — evlaser.co.kr 본사/레이저기술센터 오시는 길에
// 사용된 값과 동일. 국내 사업장은 이 약도를 그대로 노출한다.
export interface KakaoRoughmapMeta {
  key: string;
  timestamp: string;
}
export function kakaoRoughmapFor(name: string): KakaoRoughmapMeta | null {
  const n = (name ?? "").replace(/\s/g, "");
  if (n.includes("본사")) return { key: "2myza", timestamp: "1738817580497" };
  if (n.includes("기술센터") || n.includes("레이저기술")) return { key: "2myz9", timestamp: "1738817545104" };
  return null;
}
