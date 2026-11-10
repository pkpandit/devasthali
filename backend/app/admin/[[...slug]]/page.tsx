import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { PlaceholderWorkspace } from "@/components/admin/PlaceholderWorkspace";
import { getAdminRedirect, getAdminWorkspace } from "@/lib/admin-navigation";
import { requireUser } from "@/lib/server/auth";

interface AdminWorkspacePageProps {
  params: Promise<{ slug?: string[] }>;
}

export async function generateMetadata({
  params,
}: AdminWorkspacePageProps): Promise<Metadata> {
  const { slug = [] } = await params;
  const href = slug.length ? `/admin/${slug.join("/")}` : "/admin";
  const redirectTarget = getAdminRedirect(href);
  const targetHref = redirectTarget ?? href;
  const workspace = getAdminWorkspace(targetHref);

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

  // Defense-in-depth: enforce authentication at page level before data access or rendering
  await requireUser(href);

  const redirectTarget = getAdminRedirect(href);
  if (redirectTarget) {
    redirect(redirectTarget);
  }

  const workspace = getAdminWorkspace(href);

  if (!workspace) notFound();

  return <PlaceholderWorkspace workspace={workspace} />;
}
