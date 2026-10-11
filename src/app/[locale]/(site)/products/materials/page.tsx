import { redirect } from "@/i18n/navigation";
import { getLocale } from "next-intl/server";

// 재료별 단독 페이지는 "기술·재료 소개"(/products/guide)로 통합되었다.
// 기존 URL·북마크는 통합 페이지의 재료 섹션으로 자동 연결한다.
export default async function MaterialsRedirect() {
  const locale = await getLocale();
  redirect({ href: "/products/guide#material", locale });
}
