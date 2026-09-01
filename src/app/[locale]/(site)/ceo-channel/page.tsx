import type { Metadata } from "next";
import CeoChannel from "@/components/CeoChannel";

export const metadata: Metadata = {
  title: "대표이사 직속 소통센터 | EV Laser",
  description: "윤리경영 신고센터, 임직원 칭찬방, CEO 직속 고객불만 접수 — 비밀보장과 신고자 보호조치가 적용됩니다.",
};

export default function CeoChannelPage() {
  return <CeoChannel />;
}
