import type { MapProvider } from "./repo";

// Plain search-by-query deep links — no API key needed, work for any address.
export function mapSearchUrl(provider: MapProvider, query: string): string {
  const q = encodeURIComponent(query);
  return provider === "google" ? `https://www.google.com/maps/search/?api=1&query=${q}` : `https://map.naver.com/p/search/${q}`;
}
