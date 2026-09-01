import type { Metadata } from "next";
import CompanyInfo from "@/components/CompanyInfo";

export const metadata: Metadata = {
  title: "회사소개 | EV Laser",
  description: "EV Laser는 2002년 설립된 레이저기술 전문기업입니다. 연혁, 사업분야, 특허·인증 정보를 확인하세요.",
};

export default function CompanyPage() {
  return <CompanyInfo />;
}
