// ShipScout marketing site (CONTEXT.md section 3.1), ported from the prototype.
import { Nav } from "@/components/marketing/Nav";
import { Hero } from "@/components/marketing/Hero";
import { DemoCarousel } from "@/components/marketing/DemoCarousel";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { BuildInPublic } from "@/components/marketing/BuildInPublic";
import { FinalCta } from "@/components/marketing/FinalCta";
import { Footer } from "@/components/marketing/Footer";

export default function MarketingPage() {
  return (
    <>
      <Nav />
      <div className="rails" />
      <Hero />
      <DemoCarousel />
      <HowItWorks />
      <BuildInPublic />
      <FinalCta />
      <Footer />
    </>
  );
}
