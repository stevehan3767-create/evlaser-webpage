import Hero from "@/components/Hero";
import CategoryShortcuts from "@/components/CategoryShortcuts";
import Sitemap from "@/components/Sitemap";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <>
      <Hero />
      <CategoryShortcuts />
      <Sitemap />
    </>
  );
}
