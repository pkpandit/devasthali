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
        url: "/images/about/campus-showcase.jpg",
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
    images: ["/images/about/campus-showcase.jpg"],
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
      <body className="font-sans antialiased bg-[#F9FAFB] text-gray-900 selection:bg-[#B91C1C] selection:text-white min-h-screen flex flex-col">
        <ThemeProvider>
          {/* JSON-LD Rich Structured Snippets for Local School Authority */}
          <LocalSeoSchema />

          {/* Sticky Institutional Authority Bar & Mega Navbar */}
          <Header />

          {/* Real-time Ticker for Critical Circulars & Entrance Results */}
          <NoticeTicker />

          {/* Primary Viewport Main Content Shell */}
          <main className="flex-1 w-full" id="main-content">
            {children}
          </main>

          {/* Institutional Multi-Column Authority Footer */}
          <Footer />

          {/* Mobile Bottom Dock for High-Intent Actions (Phone / Admission Enquiry) */}
          <MobileStickyDock />

          {/* Smooth Scroll To Top Accelerator */}
          <ScrollToTop />
        </ThemeProvider>
      </body>
    </html>
  );
}
