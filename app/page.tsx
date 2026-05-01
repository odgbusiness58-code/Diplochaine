import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/landing/Hero";
import { PortalsSection } from "@/components/landing/PortalsSection";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { SolutionSection } from "@/components/landing/SolutionSection";
import { DocsSection } from "@/components/landing/DocsSection";
import { GallerySection } from "@/components/landing/GallerySection";
import { DemoSection } from "@/components/landing/DemoSection";
import { ContactSection } from "@/components/landing/ContactSection";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <PortalsSection />
        <ProblemSection />
        <SolutionSection />
        <DocsSection />
        <GallerySection />
        <DemoSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
