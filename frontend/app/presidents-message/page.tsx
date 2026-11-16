import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicLeadershipMember } from "@/lib/api/about-leadership";
import { LeadershipMessageTemplate } from "@/components/leadership/LeadershipMessageTemplate";

export async function generateMetadata(): Promise<Metadata> {
  const member = await getPublicLeadershipMember("presidents-message");
  if (!member) {
    return {
      title: "President’s Message | Devasthaly Vidyapeeth",
      description:
        "President’s message by Ravishankar Singh, M.L.C and President of Devasthaly Vidyapeeth, Chilkahar, Ballia.",
    };
  }
  return {
    title: `${member.pageTitle} | Devasthaly Vidyapeeth`,
    description: member.shortIntro,
  };
}

export default async function PresidentsMessagePage() {
  const member = await getPublicLeadershipMember("presidents-message");

  if (!member) {
    notFound();
  }

  return <LeadershipMessageTemplate member={member} />;
}
