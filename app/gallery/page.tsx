import React from "react";
import type { Metadata } from "next";
import { Image as ImageIcon, Camera, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Campus Photo Gallery & Student Life | Devasthaly",
  description:
    "Explore photo albums of campus infrastructure, student activities, science exhibitions, sports day, and cultural festivals at Devasthaly Vidyapeeth, Chilkahar, Ballia.",
};

export default function GalleryPage() {
  const albums = [
    { title: "Academic Infrastructure & Smart Classrooms", category: "Campus", count: "12 Photos" },
    { title: "Physics, Chemistry & Biology Laboratories", category: "Academics", count: "16 Photos" },
    { title: "Annual Athletic Meet & Cricket Championship", category: "Sports", count: "24 Photos" },
    { title: "Independence Day & Republic Day Celebrations", category: "Events", count: "18 Photos" },
    { title: "Residential Hostel Blocks & Dining Hall", category: "Hostel", count: "14 Photos" },
    { title: "Inter-School Science & Robotics Exhibition", category: "Academics", count: "20 Photos" },
  ];

  return (
    <div className="w-full bg-[#F3F4F6] py-12">
      <div className="site-container space-y-10">
        <div className="border-b border-[#E5E7EB] pb-6 text-left">
          <div className="text-xs font-bold text-[#4F46E5] uppercase tracking-widest mb-2">
            Campus Life / Media
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-black text-[#111827]">
            Photo Gallery & Student Life
          </h1>
          <p className="text-sm text-[#4B5563] mt-2">
            Moments of triumph, learning, and camaraderie captured on our vibrant 15-acre campus in Chilkahar, Ballia.
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {albums.map((album, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all group"
            >
              {/* Image Visual Container */}
              <div className="h-52 bg-[#111827] flex flex-col items-center justify-center text-white relative p-4 text-center group-hover:scale-[1.02] transition-transform">
                <Camera className="w-10 h-10 text-[#4F46E5] mb-2 opacity-90" />
                <span className="font-heading font-bold text-sm text-white/95 px-4">
                  {album.title}
                </span>
                <span className="absolute bottom-3 right-3 text-[10px] bg-black/60 backdrop-blur-sm px-2.5 py-0.5 rounded text-white/90 font-medium">
                  {album.count}
                </span>
              </div>

              <div className="p-4 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#374151] bg-[#F3F4F6] px-2.5 py-0.5 rounded border border-[#E5E7EB]">
                  {album.category}
                </span>
                <span className="text-xs text-[#4F46E5] font-bold group-hover:underline cursor-pointer">
                  View Album →
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
