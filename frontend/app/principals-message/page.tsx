import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicLeadershipMember } from "@/lib/api/about-leadership";
import { LeadershipMessageTemplate } from "@/components/leadership/LeadershipMessageTemplate";

export async function generateMetadata(): Promise<Metadata> {
  const member = await getPublicLeadershipMember("principals-message");
  if (!member) {
    return {
      title: "Principal’s Message | Devasthaly Vidyapeeth",
      description:
        "Principal’s message and educational philosophy by P. C. Shrivastava, Principal of Devasthaly Vidyapeeth, Chilkahar, Ballia.",
    };
  }
  return {
    title: `${member.pageTitle} | Devasthaly Vidyapeeth`,
    description: member.shortIntro,
  };
}

export default async function PrincipalsMessagePage() {
  const member = await getPublicLeadershipMember("principals-message");

  if (!member) {
    notFound();
  }

  return <LeadershipMessageTemplate member={member} />;
}
