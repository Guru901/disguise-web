import "@/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { TRPCReactProvider } from "@/trpc/react";
import { ThemeProvider } from "../components/theme-provider";
import BottomNavbar from "../components/bottom-nav";
import { Toaster } from "@/components/ui/sonner";
import DesktopSidebar from "../components/sidebar";

export const metadata: Metadata = {
  title: "Social Media again",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <body>
        <ThemeProvider
          defaultTheme="system"
          enableSystem
          themes={["light", "dark", "caffeine", "sunset", "t3-chat", "ghibli"]}
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
      </body>
    </html>
  );
}
