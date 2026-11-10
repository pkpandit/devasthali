import type { ReactNode } from "react";
import { headers } from "next/headers";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireUser } from "@/lib/server/auth";
import { sanitizeReturnUrl } from "@/lib/server/auth-actions";

export default async function AdminLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const headerList = await headers();
  const rawPathname = headerList.get("x-pathname") || "/admin";
  const returnUrl = await sanitizeReturnUrl(rawPathname);

  const user = await requireUser(returnUrl);

  return <AdminShell user={user}>{children}</AdminShell>;
}
