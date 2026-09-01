import Header from "@/components/Header";
import Hero from "@/components/Hero";
import SloganBanner from "@/components/SloganBanner";
import Industries from "@/components/Industries";
import TechSolutions from "@/components/TechSolutions";
import Sitemap from "@/components/Sitemap";
import Resources from "@/components/Resources";
import GlobalNetwork from "@/components/GlobalNetwork";
import News from "@/components/News";
import Careers from "@/components/Careers";
import CeoChannel from "@/components/CeoChannel";
import Support from "@/components/Support";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main id="top">
        <Hero />
        <SloganBanner />
        <Industries />
        <TechSolutions />
        <Sitemap />
        <Resources />
        <GlobalNetwork />
        <News />
        <Careers />
        <CeoChannel />
        <Support />
      </main>
      <Footer />
    </>
  );
}
