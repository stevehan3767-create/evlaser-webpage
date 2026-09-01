import type { Metadata } from "next";
import Resources from "@/components/Resources";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "자료실 | EV Laser",
  description: "EV Laser 기술자료, 동영상자료실, 적용사례를 확인하세요.",
};

export default function ResourcesPage() {
  return <Resources />;
}
