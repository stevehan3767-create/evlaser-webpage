import { NextRequest, NextResponse } from "next/server";
import { analyticsRepo } from "@/lib/repo";

export const runtime = "nodejs";
export const maxDuration = 10;

const BOT_RE = /bot|crawl|spider|slurp|bing|baidu|yandex|duckduck|facebookexternalhit|embed|preview|monitor|lighthouse|headless|pingdom|uptime|curl|wget|python-requests|axios|node-fetch/i;

// referrer 호스트로 유입 경로를 분류한다 (검색/소셜/추천/직접).
const SEARCH_HOSTS = /google\.|bing\.|yahoo\.|naver\.|daum\.|baidu\.|duckduckgo\.|yandex\./i;
const SOCIAL_HOSTS = /facebook\.|instagram\.|twitter\.|x\.com|t\.co|linkedin\.|youtube\.|youtu\.be|tiktok\.|kakao|band\.|threads\./i;

function classifyReferrer(referrer: string | undefined, selfHost: string): { source: string; host: string | null } {
  if (!referrer) return { source: "direct", host: null };
  let host = "";
  try {
    host = new URL(referrer).hostname.replace(/^www\./, "");
  } catch {
    return { source: "direct", host: null };
  }
  if (!host || host === selfHost || host.endsWith("." + selfHost)) return { source: "internal", host: null };
  if (SEARCH_HOSTS.test(host)) return { source: "search", host };
  if (SOCIAL_HOSTS.test(host)) return { source: "social", host };
  return { source: "referral", host };
}

function parseUA(ua: string): { device: string; browser: string; os: string } {
  const u = ua.toLowerCase();
  const tablet = /ipad|tablet|playbook|silk/.test(u) || (/android/.test(u) && !/mobile/.test(u));
  const mobile = /iphone|ipod|android.*mobile|windows phone|mobile/.test(u);
  const device = tablet ? "태블릿" : mobile ? "모바일" : "데스크톱";
  let browser = "기타";
  if (/edg\//.test(u)) browser = "Edge";
  else if (/samsungbrowser/.test(u)) browser = "Samsung Internet";
  else if (/whale/.test(u)) browser = "Whale";
  else if (/opr\/|opera/.test(u)) browser = "Opera";
  else if (/firefox/.test(u)) browser = "Firefox";
  else if (/chrome\//.test(u)) browser = "Chrome";
  else if (/safari/.test(u)) browser = "Safari";
  let os = "기타";
  if (/windows/.test(u)) os = "Windows";
  else if (/iphone|ipad|ipod|ios/.test(u)) os = "iOS";
  else if (/mac os x|macintosh/.test(u)) os = "macOS";
  else if (/android/.test(u)) os = "Android";
  else if (/linux/.test(u)) os = "Linux";
  return { device, browser, os };
}

function hourInTimezone(tz: string | undefined): number | undefined {
  if (!tz) return undefined;
  try {
    const s = new Intl.DateTimeFormat("en-US", { timeZone: tz, hour: "2-digit", hour12: false }).format(new Date());
    const h = parseInt(s, 10);
    return Number.isNaN(h) ? undefined : h % 24;
  } catch {
    return undefined;
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  // 종료 시 체류시간(dwell) 업데이트
  if (body.type === "dwell") {
    const id = typeof body.id === "string" ? body.id : "";
    const dwell = typeof body.dwellMs === "number" ? body.dwellMs : 0;
    if (id) await analyticsRepo.addDwell(id, dwell);
    return NextResponse.json({ ok: true });
  }

  const ua = req.headers.get("user-agent") ?? "";
  if (BOT_RE.test(ua)) return NextResponse.json({ ok: true, bot: true });

  const h = req.headers;
  const country = h.get("x-vercel-ip-country") ?? undefined;
  const city = (() => {
    const c = h.get("x-vercel-ip-city");
    try {
      return c ? decodeURIComponent(c) : undefined;
    } catch {
      return c ?? undefined;
    }
  })();
  const timezone = h.get("x-vercel-ip-timezone") ?? undefined;
  const selfHost = (h.get("host") ?? "").replace(/^www\./, "").split(":")[0];

  const path = typeof body.path === "string" ? body.path.slice(0, 300) : "/";
  // 관리자/트래킹 경로는 집계에서 제외
  if (path.startsWith("/admin") || path.startsWith("/api")) return NextResponse.json({ ok: true, skipped: true });

  const referrer = typeof body.referrer === "string" ? body.referrer : undefined;
  const { source, host } = classifyReferrer(referrer, selfHost);
  const { device, browser, os } = parseUA(ua);

  const str = (k: string) => (typeof body[k] === "string" ? (body[k] as string) : undefined);

  const id = await analyticsRepo.record({
    visitorId: str("visitorId") ?? "anon",
    sessionId: str("sessionId") ?? "anon",
    path,
    locale: str("locale"),
    referrer: referrer ? referrer.slice(0, 300) : undefined,
    refSource: source,
    refHost: host ?? undefined,
    utmSource: str("utmSource"),
    utmMedium: str("utmMedium"),
    utmCampaign: str("utmCampaign"),
    searchKeyword: str("searchKeyword"),
    country,
    city,
    timezone,
    hourLocal: hourInTimezone(timezone),
    device,
    browser,
    os,
    language: str("language"),
  });

  return NextResponse.json({ ok: true, id });
}
