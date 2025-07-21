import Navbar from "@/components/navbar";
import {
  AccountSettings,
  NotificationSettings,
  PrivacySettings,
  ProfileSettings,
} from "./settings-options";
import { SettingsNavigation } from "./settings-navigation";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function SettingsPage(props: {
  searchParams: SearchParams;
}) {
  const activeSection = String((await props.searchParams).activeSection);
  return (
    <div className="bg-background min-h-screen px-2 py-2">
      <Navbar />
      <div className="w-full flex-1 items-start py-6 md:flex md:gap-6 lg:container lg:m-auto lg:w-[calc(100vw-20rem)] lg:gap-10 lg:px-0">
        <SettingsNavigation activeSection={activeSection} />
        <div className="w-full px-2">
          {/* Main Content */}
          <div className="flex w-full flex-col overflow-hidden">
            {activeSection === "profile" && <ProfileSettings />}
            {activeSection === "privacy" && <PrivacySettings />}
            {activeSection === "notifications" && <NotificationSettings />}
            {activeSection === "account" && <AccountSettings />}
          </div>
        </div>
      </div>
    </div>
  );
}
