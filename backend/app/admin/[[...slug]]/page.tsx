import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { PlaceholderWorkspace } from "@/components/admin/PlaceholderWorkspace";
import { TopperWorkspace } from "@/components/admin/toppers/TopperWorkspace";
import { NoticeWorkspace } from "@/components/admin/notices/NoticeWorkspace";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { PublicReferenceLink } from "@/components/ui/PublicReferenceLink";
import { getAdminRedirect, getAdminWorkspace } from "@/lib/admin-navigation";
import { requireRole, requireUser } from "@/lib/server/auth";
import { prisma } from "@/lib/server/prisma";

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

  // Defense-in-depth: enforce base authentication at page level
  await requireUser(href);

  const redirectTarget = getAdminRedirect(href);
  if (redirectTarget) {
    redirect(redirectTarget);
  }

  const workspace = getAdminWorkspace(href);

  if (!workspace) notFound();

  // Specialization: /admin/academics/results renders interactive BoardResultTopper workspace
  if (href === "/admin/academics/results") {
    // Restricted strictly to SUPER_ADMIN
    await requireRole(["SUPER_ADMIN"], href);

    const toppers = await prisma.boardResultTopper.findMany({
      orderBy: [
        { academicYear: "desc" },
        { displayOrder: "asc" },
      ],
    });

    const serializedToppers = toppers.map((topper) => {
      // Explicitly omit internal photoStorageKey from serialized client props
      const { photoStorageKey: _omittedKey, ...rest } = topper;
      void _omittedKey;
      return {
        ...rest,
        scorePercent: Number(topper.scorePercent),
        createdAt: topper.createdAt.toISOString(),
        updatedAt: topper.updatedAt.toISOString(),
      };
    });

    return (
      <Card as="section" aria-labelledby="admin-workspace-title">
        <Breadcrumbs items={workspace.breadcrumbs} />

        <div className="workspace-header">
          <h1 className="workspace-title" id="admin-workspace-title" tabIndex={-1}>
            {workspace.title}
          </h1>
          {workspace.badge && <Badge>{workspace.badge}</Badge>}
        </div>

        {workspace.description && (
          <p className="workspace-description">{workspace.description}</p>
        )}

        <div className="workspace-meta-bar">
          <PublicReferenceLink
            publicHref={workspace.publicHref}
            title={workspace.title}
          />
        </div>

        <div className="workspace-content">
          <TopperWorkspace toppers={serializedToppers} />
        </div>
      </Card>
    );
  }

  // Specialization: /admin/students-parents/notices renders interactive NoticeWorkspace
  if (href === "/admin/students-parents/notices") {
    // Restricted strictly to SUPER_ADMIN
    await requireRole(["SUPER_ADMIN"], href);

    const notices = await prisma.notice.findMany({
      orderBy: [
        { displayOrder: "asc" },
        { publishDate: "desc" },
      ],
    });

    const serializedNotices = notices.map((notice) => ({
      ...notice,
      publishDate: notice.publishDate.toISOString(),
      publishedAt: notice.publishedAt ? notice.publishedAt.toISOString() : null,
      expiryDate: notice.expiryDate ? notice.expiryDate.toISOString() : null,
      createdAt: notice.createdAt.toISOString(),
      updatedAt: notice.updatedAt.toISOString(),
    }));

    return (
      <Card as="section" aria-labelledby="admin-workspace-title">
        <Breadcrumbs items={workspace.breadcrumbs} />

        <div className="workspace-header">
          <h1 className="workspace-title" id="admin-workspace-title" tabIndex={-1}>
            {workspace.title}
          </h1>
          {workspace.badge && <Badge>{workspace.badge}</Badge>}
        </div>

        {workspace.description && (
          <p className="workspace-description">{workspace.description}</p>
        )}

        <div className="workspace-meta-bar">
          <PublicReferenceLink
            publicHref={workspace.publicHref}
            title={workspace.title}
          />
        </div>

        <div className="workspace-content">
          <NoticeWorkspace notices={serializedNotices} />
        </div>
      </Card>
    );
  }

  return <PlaceholderWorkspace workspace={workspace} />;
}
