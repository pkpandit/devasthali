import React from "react";
import { Hero } from "@/components/hero";
import { FeaturedProducts } from "@/components/featured-products";
import { ServicesBento } from "@/components/services-bento";
import { PortfolioSection } from "@/components/portfolio-section";
import { TestimonialsSection } from "@/components/testimonials-section";
import { FaqSection } from "@/components/faq-section";
import { ContactSection } from "@/components/contact-section";

export const metadata = {
  title: "DevCraft Studio | Digital Templates & Bespoke Web Engineering",
  description:
    "Production-ready Next.js 15 starters, admin dashboards, and Figma kits alongside high-ticket bespoke web engineering sprints. Built for speed, scale, and conversion.",
};

export default function StudioPage() {
  return (
    <div className="flex flex-col w-full overflow-hidden bg-background text-foreground transition-colors duration-200">
      <Hero />
      <FeaturedProducts />
      <ServicesBento />
      <PortfolioSection />
      <TestimonialsSection />
      <FaqSection />
      <ContactSection />
    </div>
  );
}
