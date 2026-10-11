import { redirect } from "@/i18n/navigation";
import { getLocale } from "next-intl/server";

// 산업분야별 단독 페이지는 삭제되었다. 산업은 "설비 찾기"의 필터와 설비 상세의
// 적용 산업 태그로만 유지한다. 기존 URL·북마크는 설비 찾기(필터 열림)로 연결한다.
export default async function IndustriesRedirect() {
  const locale = await getLocale();
  redirect({ href: "/products/lineup?finder=open", locale });
}
