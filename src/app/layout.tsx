import "@/styles/globals.css";

import { type Metadata } from "next";
import { Inter } from "next/font/google";

import { TRPCReactProvider } from "@/trpc/react";
import { ThemeProvider } from "../components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { FontSelectorWrapper } from "@/components/font-provider";
import { BottomNavbar, DesktopSidebar } from "@/components/navigation";

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
                <div className="mt-20 mb-20 w-full md:mt-0 lg:ml-64 lg:w-[calc(100vw-16rem)]">
                  {children}
                </div>
              </div>
              <BottomNavbar />
            </TRPCReactProvider>
            <Toaster closeButton position="bottom-center" />
          </ThemeProvider>
        </FontSelectorWrapper>
      </body>
    </html>
  );
}
