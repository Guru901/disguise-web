"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Shield,
  Bell,
  Settings,
  Smartphone,
  Mail,
  UserX,
  Trash2,
  Camera,
} from "lucide-react";
import Navbar from "@/components/navbar";

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("profile");

  const sections = [
    { id: "profile", label: "Profile", icon: User },
    { id: "privacy", label: "Privacy", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "account", label: "Account", icon: Settings },
  ];

  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      <div className="container m-auto flex w-[calc(100vw-20rem)] flex-1 items-start py-6 md:gap-6 lg:gap-10">
        {/* Sidebar */}
        <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-max shrink-0 md:sticky md:block">
          <div className="h-full py-6 pr-6 lg:py-8">
            <nav className="grid items-start gap-2">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <Button
                    key={section.id}
                    variant="ghost"
                    onClick={() => setActiveSection(section.id)}
                    className={`justify-start gap-4 font-medium transition-colors ${activeSection === section.id ? "bg-muted text-primary" : ""}`}
                  >
                    <Icon className="h-4 w-4" />
                    {section.label}
                  </Button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex w-full flex-col overflow-hidden">
          {activeSection === "profile" && <ProfileSettings />}
          {activeSection === "privacy" && <PrivacySettings />}
          {activeSection === "notifications" && <NotificationSettings />}
          {activeSection === "account" && <AccountSettings />}
        </main>
      </div>
    </div>
  );
}

function ProfileSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Profile</h2>
        <p className="text-muted-foreground">
          Manage your public profile information.
        </p>
      </div>

      <Card className="py-6">
        <CardHeader>
          <CardTitle>Profile Picture</CardTitle>
          <CardDescription>
            This will be displayed on your profile and posts.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src="/placeholder.svg?height=80&width=80" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-2">
              <Button size="sm">
                <Camera className="mr-2 h-4 w-4" />
                Change Photo
              </Button>
              <Button variant="outline" size="sm">
                Remove
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PrivacySettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Privacy</h2>
        <p className="text-muted-foreground">
          Control who can see your content and interact with you.
        </p>
      </div>

      <Card className="py-6">
        <CardHeader>
          <CardTitle>Account Privacy</CardTitle>
          <CardDescription>
            Manage who can see your profile and posts.
          </CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Private Account</Label>
              <p className="text-muted-foreground text-sm">
                Only friends can see your posts
              </p>
            </div>
            <Switch />
          </div>
          {/* <Separator />
          <div className="space-y-2">
            <Label>Who can see your posts</Label>
            <Select defaultValue="everyone">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="everyone">Everyone</SelectItem>
                <SelectItem value="friends">Friends only</SelectItem>
              </SelectContent>
            </Select>
          </div> */}
          {/* <div className="space-y-2">
            <Label>Who can message you</Label>
            <Select defaultValue="followers">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="everyone">Everyone</SelectItem>
                <SelectItem value="followers">Followers only</SelectItem>
                <SelectItem value="none">No one</SelectItem>
              </SelectContent>
            </Select>
          </div> */}
        </CardContent>
      </Card>

      <Card className="py-6">
        <CardHeader>
          <CardTitle>Blocked Users</CardTitle>
          <CardDescription>Manage users you've blocked.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>AB</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">@blockeduser</span>
              </div>
              <Button variant="outline" size="sm">
                <UserX className="mr-2 h-4 w-4" />
                Unblock
              </Button>
            </div>
            <p className="text-muted-foreground text-sm">
              No other blocked users
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function NotificationSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Notifications</h2>
        <p className="text-muted-foreground">
          Choose what notifications you want to receive.
        </p>
      </div>

      <Card className="py-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Likes</Label>
              <p className="text-muted-foreground text-sm">
                When someone likes your post
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Comments</Label>
              <p className="text-muted-foreground text-sm">
                When someone comments on your post
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">New Friend Request</Label>
              <p className="text-muted-foreground text-sm">
                When someone sends you a friend request
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          {/* <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Direct Messages</Label>
              <p className="text-muted-foreground text-sm">
                When you receive a new message
              </p>
            </div>
            <Switch defaultChecked />
          </div> */}
        </CardContent>
      </Card>
    </div>
  );
}

function AccountSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Account</h2>
        <p className="text-muted-foreground">
          Manage your account settings and security.
        </p>
      </div>

      <Card className="py-6">
        <CardHeader>
          <CardTitle>Login Information</CardTitle>
          <CardDescription>Update your email and password.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" type="text" disabled placeholder="Username" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input id="currentPassword" type="password" showPasswordToggle />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input id="newPassword" type="password" showPasswordToggle />
          </div>
          <Button>Update Password</Button>
        </CardContent>
      </Card>

      <Card className="border-destructive py-6">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible and destructive actions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Deactivate Account</Label>
              <p className="text-muted-foreground text-sm">
                Temporarily disable your account
              </p>
            </div>
            <Button variant="outline">Deactivate</Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-destructive text-base">
                Delete Account
              </Label>
              <p className="text-muted-foreground text-sm">
                Permanently delete your account and all data
              </p>
            </div>
            <Button variant="destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
