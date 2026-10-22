import type { Metadata, Viewport } from "next";
import { Poppins, Open_Sans } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { NoticeTicker } from "@/components/NoticeTicker";
import { Footer } from "@/components/Footer";
import { MobileStickyDock } from "@/components/MobileStickyDock";
import { LocalSeoSchema } from "@/components/LocalSeoSchema";
import { ThemeProvider } from "@/components/theme-provider";

const poppins = Poppins({
  weight: ["500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

const openSans = Open_Sans({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-open-sans",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#4F46E5",
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
    <html lang="en" className={`${poppins.variable} ${openSans.variable} scroll-smooth`} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Poppins:wght@500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <LocalSeoSchema />
      </head>
      <body className="min-h-screen flex flex-col bg-background text-foreground antialiased selection:bg-[#4F46E5]/20 selection:text-[#4F46E5]">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <NoticeTicker />
          <Header />
          <main className="flex-1 w-full">{children}</main>
          <Footer />
          <MobileStickyDock />
        </ThemeProvider>
      </body>
    </html>
  );
}
