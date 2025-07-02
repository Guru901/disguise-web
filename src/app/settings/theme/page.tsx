"use client";

import Navbar from "@/components/navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Palette, Star } from "lucide-react";
import { useTheme } from "next-themes";

const themes = [
  {
    name: "Light",
    icon: <Sun className="mr-2 size-6" />,
    themeName: "light",
  },
  {
    name: "Dark",
    icon: <Moon className="mr-2 size-6" />,
    themeName: "dark",
  },
  {
    name: "Sunset",
    icon: <Palette className="mr-2 size-6" />,
    themeName: "sunset",
  },
  {
    name: "Ghibli",
    icon: <Star className="mr-2 size-6" />,
    themeName: "ghibli",
  },
  {
    name: "Pink",
    icon: <Palette className="mr-2 size-6" />,
    themeName: "t3-chat",
  },
  {
    name: "Caffeine",
    icon: <Star className="mr-2 size-6" />,
    themeName: "caffeine",
  },
];

export default function ThemeSettingsPage() {
  const { setTheme } = useTheme();

  return (
    <main>
      <Navbar />
      <div className="bg-background flex min-h-screen w-full flex-col items-center px-4 pt-8">
        <h1 className="mb-8 text-2xl font-bold">Choose Theme</h1>
        <div className="grid w-full max-w-2xl gap-6 md:grid-cols-2">
          {themes.map((theme) => (
            <Card
              key={theme.name}
              onClick={() => setTheme(theme.themeName)}
              className={`flex cursor-pointer flex-col items-start gap-3 border-2 p-6 transition-colors ${false ? "border-primary bg-muted/40" : "bg-muted/20 hover:border-muted-foreground border-transparent"}`}
            >
              <div className="mb-2 flex items-center">
                {theme.icon}
                <span className="text-lg font-semibold">{theme.name}</span>
              </div>
              <Button className="mt-2" variant="outline" size="sm" disabled>
                Select
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
