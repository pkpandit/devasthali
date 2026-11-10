import { FolderTree, FileDown } from "lucide-react";
import Link from "next/link";
import type { AdminWorkspace } from "@/types/admin";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PublicReferenceLink } from "@/components/ui/PublicReferenceLink";

interface PlaceholderWorkspaceProps {
  workspace: AdminWorkspace;
}

export function PlaceholderWorkspace({ workspace }: PlaceholderWorkspaceProps) {
  const isDocument = Boolean(workspace.isDownloadOrDocument);
  const isSectionLanding = Boolean(workspace.childItems && workspace.childItems.length > 0);
  const hasAnchor = workspace.publicHref.includes("#");

  return (
    <Card as="section" aria-labelledby="admin-workspace-title">
      {/* 1. Breadcrumb navigation */}
      <Breadcrumbs items={workspace.breadcrumbs} />

      {/* 2. Workspace Title */}
      <div className="workspace-header">
        <h1 className="workspace-title" id="admin-workspace-title" tabIndex={-1}>
          {workspace.title}
        </h1>
        {workspace.badge && <Badge>{workspace.badge}</Badge>}
      </div>

      {/* 3. Description & Public Site Context */}
      {workspace.description && (
        <p className="workspace-description">{workspace.description}</p>
      )}

      {/* Public Site Mapping Context */}
      <div className="workspace-meta-bar">
        <PublicReferenceLink
          publicHref={workspace.publicHref}
          title={workspace.title}
        />

        {hasAnchor && (
          <Badge variant="subtle">
            Anchor target: {workspace.publicHref.split("#")[1]}
          </Badge>
        )}

        {isDocument && (
          <Badge variant="doc">
            <FileDown size={13} aria-hidden="true" />
            <span>Document / PDF record</span>
          </Badge>
        )}
      </div>

      {/* Document Storage Notice if applicable */}
      {isDocument && (
        <div className="workspace-notice">
          <p>
            <strong>Document note:</strong> Public documents and PDFs are stored in static assets under <code>frontend/public/documents/original/</code>. Upload management and file replacements will be integrated in the backend storage phase.
          </p>
        </div>
      )}

      {/* 4. Main Placeholder Card (strictly states next stage without fake saves) */}
      <EmptyState
        title="Content workspace"
        description="Content editor will be added in the next stage."
      />

      {/* 5. Child Workspaces List for Section Landing Pages */}
      {isSectionLanding && workspace.childItems && (
        <div className="workspace-section-nav">
          <h2 className="workspace-section-nav__title">
            <FolderTree size={16} aria-hidden="true" />
            <span>Workspaces in this section</span>
          </h2>
          <div className="workspace-children-grid">
            {workspace.childItems.map((child) => (
              <Link
                key={child.href}
                href={child.href}
                className="workspace-child-card"
              >
                <div className="workspace-child-card__title">
                  <span>{child.label}</span>
                  {child.badge && <Badge>{child.badge}</Badge>}
                </div>
                <span className="workspace-child-card__arrow">Open workspace →</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
