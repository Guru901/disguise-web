"use client";

import Navbar from "@/components/navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Palette, Star } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect } from "react";

const themes = [
  {
    name: "Light",
    icon: <Sun className="mr-2 size-6" />,
    placeholder: "/* Paste Light theme CSS variables here */",
  },
  {
    name: "Dark",
    icon: <Moon className="mr-2 size-6" />,
    placeholder: "/* Paste Dark theme CSS variables here */",
  },
  {
    name: "Solarized",
    icon: <Palette className="mr-2 size-6" />,
    placeholder: "/* Paste Solarized theme CSS variables here */",
  },
  {
    name: "Dracula",
    icon: <Star className="mr-2 size-6" />,
    placeholder: "/* Paste Dracula theme CSS variables here */",
  },
  {
    name: "Nord",
    icon: <Palette className="mr-2 size-6" />,
    placeholder: "/* Paste Nord theme CSS variables here */",
  },
  {
    name: "Gruvbox",
    icon: <Star className="mr-2 size-6" />,
    placeholder: "/* Paste Gruvbox theme CSS variables here */",
  },
];

export default function ThemeSettingsPage() {
  const { theme } = useTheme();

  useEffect(() => {
    console.log(theme);
  }, [theme]);

  return (
    <main>
      <Navbar />
      <div className="bg-background flex min-h-screen w-full flex-col items-center px-4 pt-8">
        <h1 className="mb-8 text-2xl font-bold">Choose Theme</h1>
        <div className="grid w-full max-w-2xl gap-6 md:grid-cols-2">
          {themes.map((theme, i) => (
            <Card
              key={theme.name}
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
