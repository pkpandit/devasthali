import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicLeadershipMember } from "@/lib/api/about-leadership";
import { LeadershipMessageTemplate } from "@/components/leadership/LeadershipMessageTemplate";

export async function generateMetadata(): Promise<Metadata> {
  const member = await getPublicLeadershipMember("founders-message");
  if (!member) {
    return {
      title: "Founder’s Message | Devasthaly Vidyapeeth",
      description:
        "Founder’s message and profile of Shri Chandra Shekhar, 8th Prime Minister of India and Founder of Devasthaly Vidyapeeth, Chilkahar, Ballia.",
    };
  }
  return {
    title: `${member.pageTitle} | Devasthaly Vidyapeeth`,
    description: member.shortIntro,
  };
}

export default async function FoundersMessagePage() {
  const member = await getPublicLeadershipMember("founders-message");

  if (!member) {
    notFound();
  }

  return <LeadershipMessageTemplate member={member} />;
}
