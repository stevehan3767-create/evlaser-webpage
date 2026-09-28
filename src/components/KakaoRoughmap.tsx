"use client";

import { useEffect, useRef } from "react";

// 카카오(다음) 지도 "퍼가기" 약도(roughmap) 렌더러. evlaser.co.kr 오시는 길과
// 동일한 방식으로, 로더 스크립트를 불러온 뒤 Lander.render()로 약도를 그린다.
// key/timestamp는 카카오 지도 "퍼가기"에서 발급된 값.

interface DaumRoughmap {
  roughmap?: {
    Lander?: new (opts: { timestamp: string; key: string; mapWidth: string; mapHeight: string }) => { render: () => void };
  };
}
declare global {
  interface Window {
    daum?: DaumRoughmap;
  }
}

const LOADER_ID = "daum-roughmap-loader";
const LOADER_SRC = "https://ssl.daumcdn.net/dmaps/map_js_init/roughmapLoader.js";

let loaderPromise: Promise<void> | null = null;
function loadRoughmapLoader(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.daum?.roughmap?.Lander) return Promise.resolve();
  if (loaderPromise) return loaderPromise;
  loaderPromise = new Promise<void>((resolve, reject) => {
    const existing = document.getElementById(LOADER_ID) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject());
      return;
    }
    const s = document.createElement("script");
    s.id = LOADER_ID;
    s.charset = "UTF-8";
    s.src = LOADER_SRC;
    s.onload = () => resolve();
    s.onerror = () => reject();
    document.head.appendChild(s);
  });
  return loaderPromise;
}

export default function KakaoRoughmap({
  mapKey,
  timestamp,
  height = 220,
}: {
  mapKey: string;
  timestamp: string;
  height?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    const el = ref.current;
    if (!el) return;
    const width = Math.max(280, Math.round(el.getBoundingClientRect().width) || 600);

    const tryRender = (attempt = 0) => {
      if (cancelled) return;
      const Lander = window.daum?.roughmap?.Lander;
      if (!Lander) {
        if (attempt < 40) setTimeout(() => tryRender(attempt + 1), 150);
        return;
      }
      el.innerHTML = ""; // 재마운트 시 중복 렌더 방지
      try {
        new Lander({ timestamp, key: mapKey, mapWidth: String(width), mapHeight: String(height) }).render();
      } catch {
        // 실패 시 빈 영역만 남기며, 상위에서 "지도에서 보기" 링크가 대체 수단을 제공한다.
      }
    };

    loadRoughmapLoader().then(() => tryRender()).catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [mapKey, timestamp, height]);

  return (
    <div className="w-full overflow-hidden" style={{ height }}>
      <div
        ref={ref}
        id={`daumRoughmapContainer${timestamp}`}
        className="root_daum_roughmap root_daum_roughmap_landing"
        style={{ width: "100%", height }}
      />
    </div>
  );
}
