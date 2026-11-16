import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicLeadershipMember } from "@/lib/api/about-leadership";
import { LeadershipMessageTemplate } from "@/components/leadership/LeadershipMessageTemplate";

export async function generateMetadata(): Promise<Metadata> {
  const member = await getPublicLeadershipMember("patrons-message");
  if (!member) {
    return {
      title: "Patron’s Message | Devasthaly Vidyapeeth",
      description:
        "Patron’s message by Shri Neeraj Shekhar, Member of Rajya Sabha and Patron of Devasthaly Vidyapeeth, Chilkahar, Ballia.",
    };
  }
  return {
    title: `${member.pageTitle} | Devasthaly Vidyapeeth`,
    description: member.shortIntro,
  };
}

export default async function PatronsMessagePage() {
  const member = await getPublicLeadershipMember("patrons-message");

  if (!member) {
    notFound();
  }

  return <LeadershipMessageTemplate member={member} />;
}
