import { ArrowUpRight } from "lucide-react";

export interface PublicReferenceLinkProps {
  publicHref: string;
  title: string;
  className?: string;
}

export function PublicReferenceLink({
  publicHref,
  title,
  className = "",
}: PublicReferenceLinkProps) {
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";
  const fullUrl = `${baseUrl}${publicHref}`;

  return (
    <div className={`workspace-meta ${className}`}>
      <span className="workspace-meta__label">Public page:</span>
      <a
        href={fullUrl}
        target="_blank"
        rel="noreferrer"
        className="workspace-meta__link"
        aria-label={`View public page for ${title} (opens in new tab)`}
      >
        <span>{fullUrl}</span>
        <ArrowUpRight size={13} aria-hidden="true" />
      </a>
    </div>
  );
}
