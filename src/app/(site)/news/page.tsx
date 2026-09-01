import type { Metadata } from "next";
import News from "@/components/News";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "뉴스·소식 | EV Laser",
  description: "EV Laser의 회사소식, 전시회소식, 산업동향을 확인하세요.",
};

export default function NewsPage() {
  return <News />;
}
