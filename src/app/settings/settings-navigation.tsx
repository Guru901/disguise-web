"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  User,
  Shield,
  Bell,
  Settings,
  ChevronUp,
  XIcon,
  type LucideProps,
} from "lucide-react";

import {
  DrawerTrigger,
  DrawerContent,
  DrawerClose,
  Drawer,
} from "@/components/ui/drawer";

import {
  useEffect,
  useState,
  type ForwardRefExoticComponent,
  type RefAttributes,
} from "react";
import Link from "next/link";

export function SettingsNavigation({
  activeSection,
}: {
  activeSection: string;
}) {
  const sections = [
    { id: "profile", label: "Profile", icon: User },
    { id: "privacy", label: "Privacy", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "account", label: "Account", icon: Settings },
  ];

  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    setIsDesktop(window.innerWidth > 768);
  }, []);

  return !isDesktop ? (
    <SettingsBottomNav activeSection={activeSection} sections={sections} />
  ) : (
    <SettingsSidebar activeSection={activeSection} sections={sections} />
  );
}

function SettingsSidebar({
  activeSection,
  sections,
}: {
  activeSection: string;
  sections: {
    id: string;
    label: string;
    icon: ForwardRefExoticComponent<
      Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
    >;
  }[];
}) {
  return (
    <aside className="fixed top-14 z-30 hidden h-[calc(100vh-3.5rem)] w-max shrink-0 md:sticky md:block">
      <div className="h-full py-6 pr-6 lg:py-8">
        <nav className="grid items-start gap-2">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <Link
                key={section.id}
                href={`?activeSection=${section.id}`}
                className={buttonVariants({
                  className: `justify-start gap-4 font-medium transition-colors ${activeSection === section.id ? "bg-muted text-primary" : ""}`,
                  variant: "ghost",
                })}
              >
                <Icon className="h-4 w-4" />
                {section.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

function SettingsBottomNav({
  activeSection,
  sections,
}: {
  activeSection: string;
  sections: {
    id: string;
    label: string;
    icon: ForwardRefExoticComponent<
      Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
    >;
  }[];
}) {
  return (
    <Card className="bottom-nav fixed bottom-20 z-10 flex w-[98%] flex-row items-center justify-between p-4">
      <div></div>
      <Drawer>
        <DrawerTrigger asChild>
          <Button variant="outline" size="icon">
            <ChevronUp className="h-6 w-6" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
        </DrawerTrigger>
        <DrawerContent className="bg-background p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Navigation</h2>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon">
                <XIcon />
                <span className="sr-only">Close sidebar</span>
              </Button>
            </DrawerClose>
          </div>
          <nav className="mt-6 space-y-2">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <DrawerClose asChild key={section.id} className="w-full">
                  <Link
                    href={`?activeSection=${section.id}`}
                    className={buttonVariants({
                      className: `flex cursor-pointer justify-start ${activeSection === section.id ? "bg-muted text-primary" : ""}`,
                      variant: "ghost",
                    })}
                  >
                    <Icon />
                    {section.label}
                  </Link>
                </DrawerClose>
              );
            })}
          </nav>
        </DrawerContent>
      </Drawer>
    </Card>
  );
}
