import AiToolbelt from "@/components/AiToolbelt";
import ContactSection from "@/components/ContactSection";
import Hero from "@/components/Hero";
import ProjectGrid from "@/components/ProjectGrid";
import StackGrid from "@/components/StackGrid";

/**
 * Single-scroll landing page. Fully static: all data comes from `content/` at
 * build time.
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      {/* z-10 keeps every section above the fixed WebGL layer rendered by <Hero /> */}
      <div className="relative z-10">
        <StackGrid />
        <AiToolbelt />
        <ProjectGrid />
        <ContactSection />
      </div>
    </>
  );
}
