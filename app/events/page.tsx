import React from "react";
import type { Metadata } from "next";
import { Calendar, Clock, MapPin, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Events & Academic Calendar 2025–26 | Devasthaly",
  description:
    "Annual calendar, sports meet, science exhibition, and examination schedule for Devasthaly Vidyapeeth, Chilkahar, Ballia.",
};

export default function EventsPage() {
  const upcomingEvents = [
    {
      date: "25 Nov 2025",
      title: "Inter-School English Debate Competition",
      time: "9:30 AM – 1:30 PM",
      venue: "Auditorium Hall, Devasthaly Campus",
      desc: "Topic: 'Artificial Intelligence & the Future of Human Intellect' with participating CBSE schools from Ballia, Mau, and Ghazipur.",
    },
    {
      date: "12 Dec 2025",
      title: "Annual Sports Meet & Athletic Championship",
      time: "8:00 AM – 4:00 PM",
      venue: "5-Acre Sports Complex",
      desc: "Track and field events, relay races, martial arts demonstrations, and march-past by school houses.",
    },
    {
      date: "05 Jan 2026",
      title: "CBSE Pre-Board Examination Series (Classes X & XII)",
      time: "10:00 AM – 1:15 PM",
      venue: "Senior Secondary Examination Block",
      desc: "Comprehensive mock board examination adhering to CBSE standardized marking scheme and OMR answer sheets.",
    },
    {
      date: "26 Jan 2026",
      title: "Republic Day Patriotic Parade & Cultural Gala",
      time: "8:00 AM – 11:30 AM",
      venue: "Main Campus Flagpole & Assembly Grounds",
      desc: "Flag hoisting by the Principal, NCC troop drill, patriotic songs, and distribution of student merit certificates.",
    },
  ];

  return (
    <div className="w-full bg-[#F3F4F6] py-12">
      <div className="site-container space-y-10">
        <div className="border-b border-[#E5E7EB] pb-6 text-left">
          <div className="text-xs font-bold text-[#4F46E5] uppercase tracking-widest mb-2">
            Campus Life / Events
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-black text-[#111827]">
            Events & Academic Calendar 2025–26
          </h1>
          <p className="text-sm text-[#4B5563] mt-2">
            A vibrant schedule of academic symposiums, athletic competitions, and cultural celebrations at Chilkahar.
          </p>
        </div>

        <div className="space-y-6">
          {upcomingEvents.map((ev, idx) => (
            <div
              key={idx}
              className="bg-white p-6 sm:p-7 rounded-2xl shadow-md hover:shadow-xl flex flex-col sm:flex-row items-start sm:items-center gap-6 transition-shadow"
            >
              <div className="w-20 h-20 rounded-2xl bg-[#111827] text-white flex flex-col items-center justify-center shrink-0 border border-gray-700 shadow-xs">
                <span className="font-heading font-black text-xl leading-none">
                  {ev.date.split(" ")[0]}
                </span>
                <span className="text-[10px] uppercase font-bold text-[#4F46E5] mt-1 tracking-wider">
                  {ev.date.split(" ")[1]}
                </span>
                <span className="text-[9px] text-gray-400">{ev.date.split(" ")[2]}</span>
              </div>

              <div className="space-y-2">
                <h3 className="font-heading font-bold text-lg text-[#111827]">{ev.title}</h3>
                <div className="flex flex-wrap items-center gap-4 text-xs text-[#4B5563]">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#4F46E5]" />
                    {ev.time}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#4F46E5]" />
                    {ev.venue}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed">{ev.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
