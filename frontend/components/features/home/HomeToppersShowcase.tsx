import React from "react";
import { Container } from "@/components/ui/Container";
import { getPublicToppers } from "@/lib/api/toppers";
import { TopperCard } from "@/components/features/toppers/TopperCard";

export async function HomeToppersShowcase() {
  const result = await getPublicToppers();

  // If backend failed, times out, or has an invalid schema, omit Section 8 gracefully
  if (result.isError) {
    return null;
  }

  // Publication Policy Option 1: Homepage only displays toppers with isFeatured === true
  const featuredToppers = result.toppers.filter((t) => t.isFeatured);

  // If no featured toppers are published, hide the section without disturbing other content
  if (featuredToppers.length === 0) {
    return null;
  }

  return (
    <section className="w-full py-16 sm:py-24 bg-[#F3F4F6] border-b border-[#E5E7EB]">
      <Container>
        <div className="max-w-3xl mb-12 text-left">
          <span className="text-sm font-heading font-bold uppercase tracking-widest text-[#B91C1C] bg-white border border-[#E5E7EB] px-3.5 py-1.5 rounded-full inline-block shadow-xs">
            CBSE Merit &amp; Excellence
          </span>
          <h2 className="font-heading text-2xl sm:text-[30px] sm:leading-[40px] lg:text-[35px] lg:leading-[47px] font-semibold text-[#111827] mt-3 mb-4 tracking-tight">
            Consistent CBSE Board Results &amp; Academic Toppers
          </h2>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed font-sans">
            Consistently leading Ballia district board merit lists while grooming students for national entrance examinations and leadership careers.
          </p>
        </div>

        {/* Board Toppers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-0">
          {featuredToppers.map((topper, idx) => (
            <TopperCard key={`${topper.studentName}-${topper.academicYear}-${idx}`} topper={topper} />
          ))}
        </div>
      </Container>
    </section>
  );
}
