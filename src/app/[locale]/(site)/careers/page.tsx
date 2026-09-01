import type { Metadata } from "next";
import Careers from "@/components/Careers";

export const metadata: Metadata = {
  title: "채용 | EV Laser",
  description: "EV Laser는 레이저 기술의 미래를 함께 만들어갈 인재를 상시 채용합니다.",
};

export default function CareersPage() {
  return <Careers />;
}
