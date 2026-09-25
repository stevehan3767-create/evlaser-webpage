import Hero from "@/components/Hero";
import SloganBanner from "@/components/SloganBanner";
import TechSolutions from "@/components/TechSolutions";
import Sitemap from "@/components/Sitemap";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <>
      <Hero />
      <SloganBanner />
      <TechSolutions />
      <Sitemap />
    </>
  );
}
