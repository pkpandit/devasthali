import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicLeadershipMember } from "@/lib/api/about-leadership";
import { LeadershipMessageTemplate } from "@/components/leadership/LeadershipMessageTemplate";

export async function generateMetadata(): Promise<Metadata> {
  const member = await getPublicLeadershipMember("managers-message");
  if (!member) {
    return {
      title: "Manager’s Message | Devasthaly Vidyapeeth",
      description:
        "Manager’s message by Dr. Naveen Singh, Manager of Devasthaly Vidyapeeth, Chilkahar, Ballia.",
    };
  }
  return {
    title: `${member.pageTitle} | Devasthaly Vidyapeeth`,
    description: member.shortIntro,
  };
}

export default async function ManagersMessagePage() {
  const member = await getPublicLeadershipMember("managers-message");

  if (!member) {
    notFound();
  }

  return <LeadershipMessageTemplate member={member} />;
}
