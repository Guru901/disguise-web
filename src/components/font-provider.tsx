"use client";

import { useUserStore } from "@/lib/userStore";
import {
  Fira_Sans,
  Inter,
  Roboto,
  Spline_Sans,
  Ubuntu,
} from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
});

const spline = Spline_Sans({
  subsets: ["latin"],
});

const roboto = Roboto({
  subsets: ["latin"],
});

const fira = Fira_Sans({
  weight: ["300", "400", "500", "600"],
  subsets: ["latin"],
});
const ubuntu = Ubuntu({
  weight: ["300", "400", "500"],
  subsets: ["latin"],
});

export function FontSelectorWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const font = useUserStore((s) => s.font);

  const fontMap: Record<string, string> = {
    spline: spline.className,
    roboto: roboto.className,
    fira: fira.className,
    inter: inter.className,
    ubuntu: ubuntu.className,
  };

  const fontClass = fontMap[font] ?? "";

  return (
    <div className={fontClass} style={{ minHeight: "100vh" }}>
      {children}
    </div>
  );
}
