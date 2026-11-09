import type { Metadata, Viewport } from "next";
import { Parkinsans, Poppins } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { NoticeTicker } from "@/components/layout/NoticeTicker";
import { Footer } from "@/components/layout/Footer";
import { MobileStickyDock } from "@/components/layout/MobileStickyDock";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { LocalSeoSchema } from "@/components/features/seo/LocalSeoSchema";
import { ThemeProvider } from "@/components/layout/theme-provider";

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
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#B91C1C",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://devasthalyballia.com"),
  title: {
    default: "Devasthaly Vidyapeeth | Best CBSE School in Ballia & Rasra (UP)",
    template: "%s | Devasthaly Vidyapeeth Ballia",
  },
  description:
    "Devasthaly Vidyapeeth (Estd. 1988) is a premier CBSE-affiliated co-educational residential and day-boarding school in Chilkahar, Ballia, Uttar Pradesh. CBSE Affiliation No. 2130238. Admissions open LKG to Class XI.",
  keywords: [
    "Devasthaly Vidyapeeth",
    "Devasthali Vidyapeeth Chilkahar",
    "Best CBSE School in Ballia",
    "Top residential school in Ballia",
    "Boarding school in Eastern UP",
    "School admission in Ballia 2025",
    "CBSE School Rasra",
    "Best English Medium School Ballia",
    "devasthalyballia.com",
  ],
  authors: [{ name: "Devasthaly Vidyapeeth" }],
  publisher: "Devasthaly Vidyapeeth",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://devasthalyballia.com",
    siteName: "Devasthaly Vidyapeeth",
    title: "Devasthaly Vidyapeeth | Best CBSE School in Ballia & Rasra (UP)",
    description:
      "36+ Years of Academic Rigour, Moral Character & Leadership. CBSE Affiliated Residential & Day-Boarding School in Chilkahar, Ballia.",
    images: [
      {
        url: "/images/og-campus.jpg",
        width: 1200,
        height: 630,
        alt: "Devasthaly Vidyapeeth Campus, Chilkahar Ballia",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Devasthaly Vidyapeeth Ballia | CBSE Residential & Day School",
    description: "Affiliation No. 2130238. Estd. 1988. Admissions Open for LKG to Class XI.",
    images: ["/images/og-campus.jpg"],
  },
  alternates: {
    canonical: "https://devasthalyballia.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${poppins.variable} ${parkinsans.variable} scroll-smooth`} suppressHydrationWarning>
      <head>
        <LocalSeoSchema />
      </head>
      <body className="min-h-screen flex flex-col bg-background text-foreground antialiased selection:bg-[#B91C1C]/20 selection:text-[#B91C1C]">
        {/* WCAG 2.4.1 Bypass Blocks: Accessible Skip to Main Content Link */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2.5 focus:bg-[#B91C1C] focus:text-white focus:rounded-xl focus:shadow-2xl focus:font-heading focus:font-bold focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#111827]"
        >
          Skip to main content
        </a>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <NoticeTicker />
          <Header />
          <main id="main-content" tabIndex={-1} className="flex-1 w-full focus:outline-none">
            {children}
          </main>
          <Footer />
          <MobileStickyDock />
          <ScrollToTop />
        </ThemeProvider>
      </body>
    </html>
  );
}
