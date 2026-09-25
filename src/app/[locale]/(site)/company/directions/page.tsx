import type { Metadata } from "next";
import CompanyDirections from "@/components/CompanyDirections";

export const metadata: Metadata = {
  title: "회사소개 · 오시는 길 | EV Laser",
  description: "㈜이브이레이저 본사·사업장 위치와 찾아오시는 길을 안내합니다.",
};

export const dynamic = "force-dynamic";

export default function CompanyDirectionsPage() {
  return <CompanyDirections />;
}
