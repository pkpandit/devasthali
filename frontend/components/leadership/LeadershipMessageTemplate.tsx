import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, Quote, ArrowRight, User } from "lucide-react";
import type { LeadershipMemberData } from "@/types/about-leadership";

interface LeadershipMessageTemplateProps {
  member: LeadershipMemberData;
}

export function LeadershipMessageTemplate({ member }: LeadershipMessageTemplateProps) {
  // Split message into paragraphs
  const paragraphs = member.messageBody
    ? member.messageBody.split(/\n\s*\n/).filter((p) => p.trim().length > 0)
    : [];

  return (
    <div className="w-full bg-[#F9FAFB] pb-20">
      {/* 1. Page Header Banner (Edplus University standard) */}
      <div className="w-full bg-white border-b border-gray-200/80 py-12 sm:py-16 mb-12">
        <div className="site-container">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-100 text-[#B91C1C] text-sm font-heading font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#B91C1C]" aria-hidden="true" />
            <span>{member.breadcrumb || "About School / Leadership"}</span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl lg:text-[40px] lg:leading-[50px] font-bold text-[#111827] tracking-tight">
            {member.pageTitle}
          </h1>
          {member.shortIntro && (
            <p className="text-base text-gray-600 leading-[1.7] mt-3 max-w-3xl leading-relaxed font-sans">
              {member.shortIntro}
            </p>
          )}
        </div>
      </div>

      <div className="site-container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Left Column: Anchored Portrait Showcase (Edplus Leadership Anatomy) */}
          <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-gray-200/90 shadow-sm text-center lg:text-left space-y-4 lg:sticky lg:top-28">
            <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden border border-gray-200/80 shadow-inner bg-[#111827] group flex items-center justify-center">
              {member.imageUrl ? (
                <Image
                  src={member.imageUrl}
                  alt={member.imageAlt || `${member.name} - ${member.designation}`}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 30vw"
                  className="object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-red-100/20 flex items-center justify-center text-gray-400">
                  <User className="w-12 h-12" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              {member.badgeText && (
                <div className="absolute bottom-3 inset-x-3 text-center">
                  <span className="text-sm font-heading font-bold uppercase tracking-wider px-3 py-1 bg-[#B91C1C] text-white rounded-full shadow-md">
                    {member.badgeText}
                  </span>
                </div>
              )}
            </div>
            <div className="space-y-1.5 pt-1">
              <h2 className="font-heading text-2xl font-black text-[#111827] tracking-tight">
                {member.name}
              </h2>
              {member.termOrAffiliation ? (
                <div className="text-sm font-heading font-bold text-[#B91C1C] tracking-wide">
                  {member.termOrAffiliation}
                </div>
              ) : member.designation ? (
                <div className="text-sm font-heading font-bold text-[#B91C1C] tracking-wide">
                  {member.designation}
                </div>
              ) : null}
              {member.location && (
                <p className="text-sm text-gray-500 font-sans pt-1">
                  {member.location}
                </p>
              )}
            </div>
          </div>

          {/* Right Column: Editorial Message & Address Text */}
          <div className="lg:col-span-8 bg-white p-8 sm:p-12 rounded-3xl border border-gray-200/90 shadow-sm relative space-y-6 text-left">
            <Quote
              className="w-20 h-20 text-[#B91C1C]/10 absolute top-8 right-8 select-none pointer-events-none"
              aria-hidden="true"
            />

            {member.quote && (
              <div className="border-l-4 border-[#B91C1C] pl-5 py-1">
                <p className="font-heading font-bold text-base sm:text-lg text-[#111827] leading-relaxed italic">
                  &quot;{member.quote}&quot;
                </p>
              </div>
            )}

            <div className="space-y-5 text-gray-700 text-sm sm:text-base leading-relaxed font-sans pt-2">
              {paragraphs.map((p, idx) => (
                <p key={idx} className="text-left max-w-[72ch] leading-relaxed">
                  {p}
                </p>
              ))}

              {member.bio && (
                <div className="pt-4 border-t border-gray-100">
                  <h3 className="text-sm font-heading font-bold text-gray-900 uppercase tracking-wider mb-2">
                    Biographical Overview
                  </h3>
                  <p className="text-left max-w-[72ch] leading-relaxed text-gray-600">
                    {member.bio}
                  </p>
                </div>
              )}

              {/* Signature Section */}
              {member.signatureImageUrl && (
                <div className="pt-6 border-t border-gray-100 space-y-2 font-heading">
                  <div className="relative w-48 h-12">
                    <Image
                      src={member.signatureImageUrl}
                      alt={member.signatureAlt || `${member.name} Signature`}
                      fill
                      className="object-contain object-left"
                    />
                  </div>
                  <strong className="text-base font-bold text-[#111827] block">
                    {member.name}
                  </strong>
                  <span className="text-sm text-gray-500 font-sans block">
                    {member.designation}
                  </span>
                </div>
              )}

              {/* Call to Action */}
              {member.ctaLabel && member.ctaHref && (
                <div className="pt-6 border-t border-gray-100">
                  <Link
                    href={member.ctaHref}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#B91C1C] text-white font-heading font-bold text-sm hover:bg-[#991b1b] transition-colors shadow-xs"
                  >
                    <span>{member.ctaLabel}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
