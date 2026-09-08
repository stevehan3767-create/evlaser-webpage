"use client";

import { useEffect, useRef } from "react";

// Minimal shape of the bits of the Naver Maps JS SDK (v3) this component uses.
interface NaverMapsSdk {
  maps: {
    Map: new (el: HTMLElement, options: { center: unknown; zoom: number }) => unknown;
    LatLng: new (lat: number, lng: number) => unknown;
    Marker: new (options: { position: unknown; map: unknown }) => unknown;
  };
}

declare global {
  interface Window {
    naver?: NaverMapsSdk;
  }
}

const SCRIPT_ID = "naver-maps-sdk";

function loadNaverMapsSdk(clientId: string): Promise<NaverMapsSdk> {
  return new Promise((resolve, reject) => {
    if (window.naver?.maps) {
      resolve(window.naver);
      return;
    }
    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => (window.naver ? resolve(window.naver) : reject()));
      existing.addEventListener("error", () => reject());
      return;
    }
    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${encodeURIComponent(clientId)}`;
    script.async = true;
    script.onload = () => (window.naver ? resolve(window.naver) : reject());
    script.onerror = () => reject();
    document.head.appendChild(script);
  });
}

// 확대/축소 가능한 네이버 지도 — 네이버 클라우드 플랫폼(NCP) Client ID와
// 표시할 위치의 좌표(lat/lng)가 모두 있어야 렌더링된다.
export default function NaverMapEmbed({ lat, lng, title }: { lat: number; lng: number; title: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const clientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID;

  useEffect(() => {
    if (!clientId || !containerRef.current) return;
    let cancelled = false;
    loadNaverMapsSdk(clientId)
      .then((naver) => {
        if (cancelled || !containerRef.current) return;
        const center = new naver.maps.LatLng(lat, lng);
        const map = new naver.maps.Map(containerRef.current, { center, zoom: 16 });
        new naver.maps.Marker({ position: center, map });
      })
      .catch(() => {
        // 스크립트 로드 실패 시 조용히 빈 지도 영역만 남긴다 — 상위에서
        // 항상 "지도에서 보기" 링크도 함께 보여주므로 대체 수단은 있다.
      });
    return () => {
      cancelled = true;
    };
  }, [clientId, lat, lng]);

  if (!clientId) return null;

  return <div ref={containerRef} role="img" aria-label={title} className="w-full h-[220px]" />;
}
