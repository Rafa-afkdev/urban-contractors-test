import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { LanguageToggle } from "@/components/ui/language-toggle"; // Updated import statement
import ClientRouteGuard from "./client-route-guard";
import { ConditionalProfileDropdown } from "./conditional-profile-dropdown";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Urban Contractors",
  description: "Urban Contractors",
};



export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: any;
}>) {
    const {locale} = await params;
  if(!routing.locales.includes(locale as any)) {
    notFound();
  }

    const messages = await getMessages(locale);
    return (
      <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
         <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
        <NextIntlClientProvider messages={messages}>
            <div className="fixed top-4 right-4 z-50 flex gap-2">
              <LanguageToggle />
              <ModeToggle />
              <ConditionalProfileDropdown />
            </div>
        <ClientRouteGuard>
          {children}
        </ClientRouteGuard>
        </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
