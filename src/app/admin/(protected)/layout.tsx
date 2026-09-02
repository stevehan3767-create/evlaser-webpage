import Link from "next/link";
import { logout } from "../login/actions";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full mx-auto max-w-[1000px] px-7 py-10">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-line">
        <nav className="flex gap-5 text-[13.5px] font-semibold">
          <Link href="/admin">대시보드</Link>
          <Link href="/admin/content-pages">제품·기술 페이지 관리</Link>
          <Link href="/admin/resources">자료실 관리</Link>
          <Link href="/admin/news">뉴스 관리</Link>
          <Link href="/admin/inquiries">문의 내역</Link>
        </nav>
        <form action={logout}>
          <button type="submit" className="text-[12.5px] text-ink-soft hover:text-red">
            로그아웃
          </button>
        </form>
      </div>
      {children}
    </div>
  );
}
