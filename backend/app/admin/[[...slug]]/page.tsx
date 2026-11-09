import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PlaceholderWorkspace } from "@/components/admin/PlaceholderWorkspace";
import { getAdminWorkspace } from "@/lib/admin-navigation";

interface AdminWorkspacePageProps {
  params: Promise<{ slug?: string[] }>;
}

export async function generateMetadata({
  params,
}: AdminWorkspacePageProps): Promise<Metadata> {
  const { slug = [] } = await params;
  const href = slug.length ? `/admin/${slug.join("/")}` : "/admin";
  const workspace = getAdminWorkspace(href);

  if (!workspace) {
    return {
      title: "Workspace Not Found",
    };
  }

  return {
    title: workspace.title,
  };
}

export default async function AdminWorkspacePage({
  params,
}: AdminWorkspacePageProps) {
  const { slug = [] } = await params;
  const href = slug.length ? `/admin/${slug.join("/")}` : "/admin";
  const workspace = getAdminWorkspace(href);

  if (!workspace) notFound();

  return <PlaceholderWorkspace workspace={workspace} />;
}
