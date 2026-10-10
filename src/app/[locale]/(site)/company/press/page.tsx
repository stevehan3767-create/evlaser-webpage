import { redirect } from "@/i18n/navigation";
import { getLocale } from "next-intl/server";

// 언론·연구활동은 '뉴스·소식' 하위(/news/press)로 이동했다. 기존 주소는 자동 연결.
export default async function CompanyPressRedirect() {
  const locale = await getLocale();
  redirect({ href: "/news/press", locale });
}
