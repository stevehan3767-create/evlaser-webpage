import { Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import VisitorTracker from "@/components/VisitorTracker";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <Suspense fallback={null}>
        <VisitorTracker />
      </Suspense>
    </>
  );
}
