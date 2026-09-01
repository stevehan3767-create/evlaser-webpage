import type { Metadata } from "next";
import Support from "@/components/Support";

export const metadata: Metadata = {
  title: "문의하기 | EV Laser",
  description: "제품, 기술, 협력 제안 등 EV Laser에 문의하세요. 자주 묻는 질문도 확인하실 수 있습니다.",
};

export default function SupportPage() {
  return <Support />;
}
