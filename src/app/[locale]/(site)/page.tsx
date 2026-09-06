import Hero from "@/components/Hero";
import SloganBanner from "@/components/SloganBanner";
import Industries from "@/components/Industries";
import TechSolutions from "@/components/TechSolutions";
import ClientLogos from "@/components/ClientLogos";
import Sitemap from "@/components/Sitemap";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <>
      <Hero />
      <SloganBanner />
      <Industries />
      <TechSolutions />
      <ClientLogos />
      <Sitemap />
    </>
  );
}
