import type { Metadata } from "next";
import { Parkinsans, Poppins } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

const poppins = Poppins({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

const parkinsans = Parkinsans({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-parkinsans",
  display: "swap",
  adjustFontFallback: false,
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});

export const metadata: Metadata = {
  title: {
    default: "Admin preview | Devasthaly Vidyapeeth",
    template: "%s | Admin preview",
  },
  description: "Local-only administration workspace preview.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html className={`${poppins.variable} ${parkinsans.variable}`} lang="en">
      <body>{children}</body>
    </html>
  );
}
