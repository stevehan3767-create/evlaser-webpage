import Hero from "@/components/Hero";
import CategoryShortcuts from "@/components/CategoryShortcuts";
import SloganBanner from "@/components/SloganBanner";
import TechSolutions from "@/components/TechSolutions";
import Sitemap from "@/components/Sitemap";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <>
      <Hero />
      <CategoryShortcuts />
      <SloganBanner />
      <TechSolutions />
      <Sitemap />
    </>
  );
}
