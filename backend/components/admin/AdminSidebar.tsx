import { ChevronDown, ChevronRight, X } from "lucide-react";
import Link from "next/link";
import type { RefObject } from "react";
import { adminSections } from "@/lib/admin-navigation";

interface AdminSidebarProps {
  pathname: string;
  mobileMenuOpen: boolean;
  activeSectionId: string | null;
  userToggledSections: Record<string, boolean>;
  initialFocusRef: RefObject<HTMLButtonElement | null>;
  onToggleSection: (sectionId: string) => void;
  onNavigate: () => void;
  onClose: () => void;
}

export function AdminSidebar({
  pathname,
  mobileMenuOpen,
  activeSectionId,
  userToggledSections,
  initialFocusRef,
  onToggleSection,
  onNavigate,
  onClose,
}: AdminSidebarProps) {
  return (
    <aside
      aria-label="Admin content navigation"
      className="admin-sidebar"
      data-open={mobileMenuOpen}
      id="admin-sidebar"
    >
      <div className="admin-sidebar__mobile-top">
        <span className="admin-sidebar__mobile-title">Content navigation</span>
        <button
          ref={initialFocusRef}
          aria-label="Close navigation menu"
          className="sidebar-close"
          onClick={onClose}
          type="button"
        >
          <X aria-hidden="true" size={20} />
        </button>
      </div>

      <p className="admin-sidebar__label">Website content</p>

      <nav aria-label="Content menu" className="admin-nav">
        {/* Top-Level Home Workspace */}
        <Link
          aria-current={pathname === "/admin" ? "page" : undefined}
          className="admin-nav__home"
          href="/admin"
          onClick={onNavigate}
        >
          Home
        </Link>

        {/* Mapped Content Sections in exact frontend sequence */}
        {adminSections.map((section) => {
          const sectionIsActive = activeSectionId === section.id;
          const isExpanded =
            userToggledSections[section.id] !== undefined
              ? userToggledSections[section.id]
              : sectionIsActive;
          const panelId = `admin-nav-${section.id}`;

          return (
            <div className="admin-nav__section" key={section.id}>
              <div className="admin-nav__section-row">
                {/* Parent Section Overview Link */}
                <Link
                  aria-current={pathname === section.href ? "page" : undefined}
                  className="admin-nav__parent-link"
                  data-active={sectionIsActive}
                  href={section.href}
                  onClick={onNavigate}
                >
                  <span>{section.label}</span>
                </Link>

                {/* Submenu Expand/Collapse Button */}
                <button
                  aria-controls={panelId}
                  aria-expanded={isExpanded}
                  aria-label={`${isExpanded ? "Collapse" : "Expand"} ${section.label} menu`}
                  className="admin-nav__expand"
                  onClick={() => onToggleSection(section.id)}
                  type="button"
                >
                  {isExpanded ? (
                    <ChevronDown aria-hidden="true" size={17} />
                  ) : (
                    <ChevronRight aria-hidden="true" size={17} />
                  )}
                </button>
              </div>

              {/* Submenu Child Links Panel */}
              {isExpanded && (
                <div className="admin-nav__children" id={panelId}>
                  {section.groups.map((group, groupIndex) => (
                    <div key={group.heading ?? `${section.id}-group-${groupIndex}`}>
                      {group.heading && (
                        <p className="admin-nav__group-label">{group.heading}</p>
                      )}
                      <div className="admin-nav__group-items">
                        {group.items.map((item) => (
                          <Link
                            aria-current={pathname === item.href ? "page" : undefined}
                            className="admin-nav__child-link"
                            href={item.href}
                            key={item.href}
                            onClick={onNavigate}
                          >
                            <span>{item.label}</span>
                            {item.badge && (
                              <span className="admin-nav__badge">{item.badge}</span>
                            )}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
