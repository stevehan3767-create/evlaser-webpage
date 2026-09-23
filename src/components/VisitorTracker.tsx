"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

// 익명 방문자 ID(1년)와 세션 ID(30분 미활동 시 갱신)를 브라우저에 보관한다.
// 개인을 특정하는 정보는 담지 않으며, 서버는 IP 원본을 저장하지 않는다.
function getVisitorId(): string {
  try {
    let v = localStorage.getItem("evl_vid");
    if (!v) {
      v = (crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)) as string;
      localStorage.setItem("evl_vid", v);
    }
    return v;
  } catch {
    return "anon";
  }
}

function getSessionId(): string {
  try {
    const now = Date.now();
    const last = Number(localStorage.getItem("evl_sts") || 0);
    let s = localStorage.getItem("evl_sid");
    if (!s || now - last > 30 * 60 * 1000) {
      s = (crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)) as string;
      localStorage.setItem("evl_sid", s);
    }
    localStorage.setItem("evl_sts", String(now));
    return s;
  } catch {
    return "anon";
  }
}

export default function VisitorTracker() {
  const pathname = usePathname();
  const search = useSearchParams();
  const current = useRef<{ id: string; start: number } | null>(null);
  const firstOfSession = useRef(true);

  useEffect(() => {
    // 이전 페이지 체류시간 기록
    function flush() {
      const c = current.current;
      if (!c) return;
      const dwellMs = Date.now() - c.start;
      current.current = null;
      try {
        const blob = new Blob([JSON.stringify({ type: "dwell", id: c.id, dwellMs })], { type: "application/json" });
        navigator.sendBeacon("/api/track", blob);
      } catch {
        /* noop */
      }
    }

    flush(); // 직전 페이지 마감

    // 사이트 내부 검색어(예: /search?q=..., ?query=..., ?keyword=...) 추출
    const kw =
      search.get("q") || search.get("query") || search.get("keyword") || search.get("search") || undefined;

    const payload = {
      type: "view",
      path: pathname + (search.toString() ? `?${search.toString()}` : ""),
      // referrer는 세션 첫 페이지에서만 유입경로로서 의미가 있다.
      referrer: firstOfSession.current ? document.referrer || undefined : undefined,
      utmSource: search.get("utm_source") || undefined,
      utmMedium: search.get("utm_medium") || undefined,
      utmCampaign: search.get("utm_campaign") || undefined,
      searchKeyword: kw,
      visitorId: getVisitorId(),
      sessionId: getSessionId(),
      locale: (document.documentElement.lang || "ko").slice(0, 5),
      language: navigator.language,
    };
    firstOfSession.current = false;

    let cancelled = false;
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    })
      .then((r) => r.json())
      .then((d: { id?: string }) => {
        if (!cancelled && d?.id) current.current = { id: d.id, start: Date.now() };
      })
      .catch(() => {});

    // 탭을 닫거나 숨길 때 체류시간 전송
    function onHide() {
      if (document.visibilityState === "hidden") flush();
    }
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", flush);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", flush);
      flush();
    };
  }, [pathname, search]);

  return null;
}
