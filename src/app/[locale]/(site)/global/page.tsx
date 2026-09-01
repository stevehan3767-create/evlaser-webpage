import type { Metadata } from "next";
import GlobalNetwork from "@/components/GlobalNetwork";

export const metadata: Metadata = {
  title: "글로벌 네트워크 | EV Laser",
  description: "EV Laser 지사·연락처와 전 세계 대리점 정보를 확인하세요.",
};

export default function GlobalPage() {
  return <GlobalNetwork />;
}
