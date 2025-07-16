import "@/styles/globals.css";

import { type Metadata } from "next";
import { Inter } from "next/font/google";

import { TRPCReactProvider } from "@/trpc/react";
import { ThemeProvider } from "../components/theme-provider";
import BottomNavbar from "../components/bottom-nav";
import { Toaster } from "@/components/ui/sonner";
import DesktopSidebar from "../components/sidebar";
import { FontSelectorWrapper } from "@/components/font-provider";

export const metadata: Metadata = {
  title: "Social Media again",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const inter = Inter({
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Use a client component to get the font from the store
  return (
    <html lang="en">
      <body className={inter.className}>
        <FontSelectorWrapper>
          <ThemeProvider
            defaultTheme="system"
            enableSystem
            themes={[
              "light",
              "dark",
              "caffeine",
              "sunset",
              "t3-chat",
              "ghibli",
            ]}
          >
            <TRPCReactProvider>
              <div className="flex">
                <DesktopSidebar />
                <div className="mb-20 w-full lg:ml-64 lg:w-[calc(100vw-16rem)]">
                  {children}
                </div>
              </div>
              <BottomNavbar />
            </TRPCReactProvider>
            <Toaster />
          </ThemeProvider>
        </FontSelectorWrapper>
      </body>
    </html>
  );
}
