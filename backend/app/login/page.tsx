import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { getCurrentUser } from "@/lib/server/auth";
import { sanitizeReturnUrl } from "@/lib/server/auth-actions";

export const metadata: Metadata = {
  title: "Admin Sign In | Devasthaly Vidyapeeth",
  description: "Administrative staff authentication portal for Devasthaly Vidyapeeth.",
};

interface LoginPageProps {
  searchParams: Promise<{ returnUrl?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const user = await getCurrentUser();
  const { returnUrl: rawReturnUrl } = await searchParams;
  const returnUrl = await sanitizeReturnUrl(rawReturnUrl);

  // If already authenticated, redirect directly into the admin workspace
  if (user) {
    redirect(returnUrl);
  }

  return (
    <main className="login-page">
      <div className="login-page__container">
        <LoginForm returnUrl={returnUrl} />
      </div>
    </main>
  );
}
