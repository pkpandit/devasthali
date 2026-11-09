import { FileText, ChevronRight, ArrowUpRight, FolderTree, FileDown } from "lucide-react";
import Link from "next/link";
import type { AdminWorkspace } from "@/lib/admin-navigation";

interface PlaceholderWorkspaceProps {
  workspace: AdminWorkspace;
}

export function PlaceholderWorkspace({ workspace }: PlaceholderWorkspaceProps) {
  const isDocument = Boolean(workspace.isDownloadOrDocument);
  const isSectionLanding = Boolean(workspace.childItems && workspace.childItems.length > 0);
  const hasAnchor = workspace.publicHref.includes("#");

  return (
    <section aria-labelledby="admin-workspace-title" className="workspace-card">
      {/* 1. Breadcrumb navigation */}
      <nav aria-label="Breadcrumb" className="workspace-breadcrumbs">
        {workspace.breadcrumbs.map((crumb, index) => (
          <span className="workspace-breadcrumb" key={`${crumb}-${index}`}>
            {index > 0 && <ChevronRight aria-hidden="true" size={14} />}
            <span>{crumb}</span>
          </span>
        ))}
      </nav>

      {/* 2. Workspace Title */}
      <div className="workspace-header">
        <h1 className="workspace-title" id="admin-workspace-title" tabIndex={-1}>
          {workspace.title}
        </h1>
        {workspace.badge && (
          <span className="admin-nav__badge">{workspace.badge}</span>
        )}
      </div>

      {/* 3. Description & Public Site Context */}
      {workspace.description && (
        <p className="workspace-description">{workspace.description}</p>
      )}

      {/* Public Site Mapping Context */}
      <div className="workspace-meta-bar">
        <div className="workspace-meta">
          <span className="workspace-meta__label">Public page:</span>
          <a
            href={`http://localhost:3000${workspace.publicHref}`}
            target="_blank"
            rel="noreferrer"
            className="workspace-meta__link"
            aria-label={`View public page for ${workspace.title} (opens in new tab)`}
          >
            <span>http://localhost:3000{workspace.publicHref}</span>
            <ArrowUpRight size={13} aria-hidden="true" />
          </a>
        </div>

        {hasAnchor && (
          <span className="workspace-tag">
            Anchor target: {workspace.publicHref.split("#")[1]}
          </span>
        )}

        {isDocument && (
          <span className="workspace-tag workspace-tag--doc">
            <FileDown size={13} aria-hidden="true" />
            <span>Document / PDF record</span>
          </span>
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
      <div className="workspace-placeholder">
        <span aria-hidden="true" className="workspace-placeholder__mark">
          <FileText size={22} />
        </span>
        <h2>Content workspace</h2>
        <p>Content editor will be added in the next stage.</p>
      </div>

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
                  {child.badge && (
                    <span className="admin-nav__badge">{child.badge}</span>
                  )}
                </div>
                <span className="workspace-child-card__arrow">Open workspace →</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
