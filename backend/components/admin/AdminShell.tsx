"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { AdminFooter } from "@/components/admin/AdminFooter";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { getAdminSectionId, getAdminWorkspace } from "@/lib/admin-navigation";
import type { SafeUser } from "@/lib/server/session";

interface AdminShellProps {
  children: React.ReactNode;
  user?: SafeUser | null;
}

export function AdminShell({ children, user }: AdminShellProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userToggledSections, setUserToggledSections] = useState<Record<string, boolean>>({});
  const toggleButtonRef = useRef<HTMLButtonElement>(null);
  const initialFocusRef = useRef<HTMLButtonElement>(null);
  const previousPathname = useRef(pathname);

  const activeSectionId = getAdminSectionId(pathname);
  const workspaceTitle = getAdminWorkspace(pathname)?.title ?? "Admin";

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
    window.requestAnimationFrame(() => toggleButtonRef.current?.focus());
  }, []);

  // Set focus to workspace heading on route change for screen reader accessibility
  useEffect(() => {
    if (previousPathname.current === pathname) return;
    previousPathname.current = pathname;
    document.getElementById("admin-workspace-title")?.focus();
  }, [pathname]);

  // Close drawer and clear lock when viewport expands to desktop width (>=1024px)
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const handleViewportChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setMobileMenuOpen(false);
      }
    };
    mediaQuery.addEventListener("change", handleViewportChange);
    return () => {
      mediaQuery.removeEventListener("change", handleViewportChange);
    };
  }, [mobileMenuOpen]);

  // Trap focus, lock scroll, and handle Escape key for mobile drawer
  useEffect(() => {
    if (!mobileMenuOpen) return;

    const bodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => initialFocusRef.current?.focus(), 150);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMobileMenu();
        return;
      }

      if (event.key !== "Tab") return;
      const drawer = document.getElementById("admin-sidebar");
      const focusableElements = drawer?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      );
      if (!focusableElements?.length) return;

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        last.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = bodyOverflow;
    };
  }, [closeMobileMenu, mobileMenuOpen]);

  const handleToggleSection = (sectionId: string) => {
    setUserToggledSections((prev) => {
      const isCurrentlyExpanded =
        prev[sectionId] !== undefined
          ? prev[sectionId]
          : activeSectionId === sectionId;
      return {
        ...prev,
        [sectionId]: !isCurrentlyExpanded,
      };
    });
  };

  const handleNavigate = () => {
    if (mobileMenuOpen) closeMobileMenu();
  };

  return (
    <div className="admin-shell">
      <a href="#admin-main" className="skip-to-content">
        Skip to main content
      </a>
      <AdminHeader
        mobileMenuOpen={mobileMenuOpen}
        onToggleMenu={() => setMobileMenuOpen((open) => !open)}
        toggleButtonRef={toggleButtonRef}
        workspaceTitle={workspaceTitle}
        user={user}
      />
      <div className="admin-body">
        {mobileMenuOpen && (
          <button
            aria-label="Close navigation menu"
            className="sidebar-backdrop"
            data-open="true"
            onClick={closeMobileMenu}
            type="button"
          />
        )}
        <AdminSidebar
          activeSectionId={activeSectionId}
          initialFocusRef={initialFocusRef}
          mobileMenuOpen={mobileMenuOpen}
          onClose={closeMobileMenu}
          onNavigate={handleNavigate}
          onToggleSection={handleToggleSection}
          pathname={pathname}
          userToggledSections={userToggledSections}
        />
        <main className="admin-main" id="admin-main" tabIndex={-1}>
          {children}
          <AdminFooter />
        </main>
      </div>
    </div>
  );
}
