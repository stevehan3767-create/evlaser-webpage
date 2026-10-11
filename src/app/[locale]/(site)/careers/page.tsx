import type { Metadata } from "next";
import Careers from "@/components/Careers";

export const metadata: Metadata = {
  title: "채용 | EV Laser",
  description: "EV Laser는 레이저 기술의 미래를 함께 만들어갈 인재를 상시 채용합니다.",
};

// 모집 마감일 자동 처리(applyUntil)가 재배포 없이 요청 시점 기준으로 동작하도록 동적 렌더링.
export const dynamic = "force-dynamic";

export default function CareersPage() {
  return <Careers />;
}
