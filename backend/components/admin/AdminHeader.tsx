import { ArrowUpRight, Menu } from "lucide-react";
import Link from "next/link";
import type { RefObject } from "react";

interface AdminHeaderProps {
  workspaceTitle: string;
  mobileMenuOpen: boolean;
  onToggleMenu: () => void;
  toggleButtonRef: RefObject<HTMLButtonElement | null>;
}

export function AdminHeader({
  workspaceTitle,
  mobileMenuOpen,
  onToggleMenu,
  toggleButtonRef,
}: AdminHeaderProps) {
  const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";

  return (
    <header className="admin-header">
      <div className="admin-header__left">
        <button
          ref={toggleButtonRef}
          aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-controls="admin-sidebar"
          aria-expanded={mobileMenuOpen}
          className="sidebar-toggle"
          onClick={onToggleMenu}
          type="button"
        >
          <Menu aria-hidden="true" size={21} />
        </button>

        <Link
          aria-label="Devasthaly Vidyapeeth admin preview home"
          className="admin-header__brand"
          href="/admin"
        >
          <span aria-hidden="true" className="admin-brand-mark">
            DV
          </span>
          <span>
            <span className="admin-header__brand-name">Devasthaly Vidyapeeth</span>
            <span className="admin-header__brand-note">Local admin preview</span>
          </span>
        </Link>

        <span aria-hidden="true" className="admin-header__divider" />
        <span aria-live="polite" className="admin-header__workspace">
          {workspaceTitle}
        </span>
      </div>

      <div className="admin-header__actions">
        <a
          aria-label="Open public site (opens in new tab)"
          className="public-site-link"
          href={frontendUrl}
          rel="noreferrer"
          target="_blank"
        >
          <ArrowUpRight aria-hidden="true" size={17} />
          <span>Open public site</span>
        </a>
      </div>
    </header>
  );
}
