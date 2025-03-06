import type React from "react";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import Link from "next/link";
import "./globals.css";
import HeaderAuth from "@/components/header-auth";
import { ThemeSwitcher } from "@/components/theme-switcher";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Student Housing - Find Your Perfect Off-Campus Home",
  description: "Browse and list off-campus student accommodations with ease.",
};

const geistSans = Geist({
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={geistSans.className} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex flex-col min-h-screen">
            <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="container flex h-16 items-center">
                <Link href="/" className="flex items-center space-x-2">
                  <span className="font-bold text-xl">StudentHousing</span>
                </Link>
                <nav className="flex items-center ml-auto space-x-6 text-sm font-medium">
                  <Link
                    href="/properties"
                    className="transition-colors hover:text-foreground/80 text-foreground/60"
                  >
                    Browse Listings
                  </Link>
                  <Link
                    href="/dashboard/new"
                    className="transition-colors hover:text-foreground/80 text-foreground/60"
                  >
                    List Property
                  </Link>
                  <HeaderAuth />
                  <ThemeSwitcher />
                </nav>
              </div>
            </header>
            <main className="flex-1">
              <div className="container py-6">{children}</div>
            </main>
            <footer className="border-t py-6 md:py-0">
              <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
                <p className="text-sm text-muted-foreground">
                  © 2024 StudentHousing. All rights reserved.
                </p>
                <p className="text-sm text-muted-foreground">
                  Powered by{" "}
                  <a
                    href="https://supabase.com/?utm_source=create-next-app&utm_medium=template&utm_term=nextjs"
                    target="_blank"
                    className="font-semibold hover:underline"
                    rel="noreferrer"
                  >
                    Supabase
                  </a>
                </p>
              </div>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
