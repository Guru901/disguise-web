"use client";

import { useState } from "react";
import Image from "next/image";
import {
  ArrowLeft,
  Share,
  Users,
  Crown,
  Calendar,
  Flame,
  Clock,
  TrendingUp,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { PostCard } from "@/components/post-card";
import useGetUser from "@/lib/use-get-user";
import Navbar from "@/components/navbar";

const communityData = {
  name: "Photography Hub",
  handle: "photography",
  description:
    "A creative space for photographers to share their work, learn techniques, and connect with fellow artists.",
  longDescription:
    "Welcome to Photography Hub! This community is dedicated to the art and craft of photography. Whether you're a beginner with your first camera or a seasoned professional, this is your space to share, learn, and grow together.",
  members: 2400000,
  online: 12500,
  created: "2020-03-15",
  avatar: "/placeholder.svg?height=80&width=80",
  banner: "",
  isJoined: false,
  verified: true,
  category: "Creative Arts",
  guidelines: [
    "Share original work and give credit where due",
    "Be constructive with feedback and criticism",
    "No spam or excessive self-promotion",
    "Use relevant tags to help others discover your content",
    "Respect copyright and intellectual property",
  ],
  moderators: [
    {
      name: "Alex Chen",
      username: "alexphoto",
      avatar: "/placeholder.svg?height=32&width=32",
      role: "Lead Moderator",
    },
    {
      name: "Sarah Kim",
      username: "sarahsnaps",
      avatar: "/placeholder.svg?height=32&width=32",
      role: "Community Manager",
    },
    {
      name: "Mike Torres",
      username: "mikelens",
      avatar: "/placeholder.svg?height=32&width=32",
      role: "Content Moderator",
    },
  ],
  tags: [
    "Landscape",
    "Portrait",
    "Street",
    "Wildlife",
    "Tutorial",
    "Gear Review",
  ],
};

const posts = [
  {
    id: "2ec5230b-28ca-4387-9987-44d547145cd9",
    title: "Multiple images work now",
    content: "Took a shit load of time, to if u find a bug report",
    commentsCount: 0,
    isPublic: true,
    likes: [],
    dislikes: [],
    createdBy: {
      id: "3bf18e98-38b1-4a80-8e1f-695a162661fb",
      username: "Admin",
      password: "$2b$10$lrWnJ6X65MCkTVfSuBlaQ.VzllslMsNY9AXQeWBdSnFnUw8vjM3eq",
      avatar:
        "https://res.cloudinary.com/dvydarjuu/image/upload/v1752778811/uwn1z2uftnenss4tlghq.jpg",
      posts: [Array],
      friends: [Array],
      createdAt: "2025-06-22 17:59:20.810122",
      lastOnline: "2025-08-01 23:08:20.97",
      blockedUsers: [],
      accountType: "public",
      isDeactivated: false,
      deactivatedTill: null,
      isDeleted: false,
      receiveNotificationsForFriendRequest: true,
      receiveNotificationsForLike: true,
      receiveNotificationsForComment: true,
      receiveNotificationsForMention: null,
      receiveNotificationsForFriendPost: true,
      savedPosts: [Array],
    },
    createdAt: "2025-07-31 20:20:06.693478",
    savedCount: 0,
    image: [
      "https://res.cloudinary.com/dvydarjuu/video/upload/v1753993188/um19pdvcft6wf5wkscng.mp4",
      "https://res.cloudinary.com/dvydarjuu/video/upload/v1753993194/mni54q8phyorsapklpal.mp4",
      "https://res.cloudinary.com/dvydarjuu/image/upload/v1753993197/amhuufg4cnixyarquv2t.jpg",
      "https://res.cloudinary.com/dvydarjuu/image/upload/v1753993197/q13yedge3i1x6ksar0xr.jpg",
      "https://res.cloudinary.com/dvydarjuu/image/upload/v1753993198/lb9comc47uogs3cvnp3k.jpg",
      "https://res.cloudinary.com/dvydarjuu/image/upload/v1753993198/cnmbbatbfnwnpxqw7a1a.jpg",
      "https://res.cloudinary.com/dvydarjuu/image/upload/v1753993198/bjv0ngmcfrk1bjnwiyfw.jpg",
    ],
  },
  {
    id: "427df8f2-da9b-4605-896f-03b2cf8a92d3",
    title: "Some updates",
    content:
      "\n" +
      "Things that work\n" +
      "\n" +
      "1. The ui looks better\n" +
      "2. There is a settings page (everything there works)\n" +
      "3.  You can now save posts\n" +
      "4. The author can now edit posts\n" +
      "5. The author can now edit their comments\n" +
      "6. The formatting when uploading content in a post will stay the same as u made it\n" +
      "7. Now u can use tags with hashes like #something\n" +
      "8. In settings u can change the font for the website (spline sans is best imo)\n" +
      "9. You can block users\n" +
      "\n" +
      "-------------------------------------------------------------------------------------\n" +
      "\n" +
      "Things that will work\n" +
      "\n" +
      "1. Tag based pages like the posts filtering based on tags\n" +
      "2. Communities feature\n" +
      "3. Multiple images and videos in the same posts",
    commentsCount: 0,
    isPublic: true,
    likes: [],
    dislikes: [],
    createdBy: {
      id: "3bf18e98-38b1-4a80-8e1f-695a162661fb",
      username: "Admin",
      password: "$2b$10$lrWnJ6X65MCkTVfSuBlaQ.VzllslMsNY9AXQeWBdSnFnUw8vjM3eq",
      avatar:
        "https://res.cloudinary.com/dvydarjuu/image/upload/v1752778811/uwn1z2uftnenss4tlghq.jpg",
      posts: [Array],
      friends: [Array],
      createdAt: "2025-06-22 17:59:20.810122",
      lastOnline: "2025-08-01 23:08:20.97",
      blockedUsers: [],
      accountType: "public",
      isDeactivated: false,
      deactivatedTill: null,
      isDeleted: false,
      receiveNotificationsForFriendRequest: true,
      receiveNotificationsForLike: true,
      receiveNotificationsForComment: true,
      receiveNotificationsForMention: null,
      receiveNotificationsForFriendPost: true,
      savedPosts: [Array],
    },
    createdAt: "2025-07-31 17:42:34.966806",
    savedCount: 0,
    image: [""],
  },
  {
    id: "c493dfe8-e240-45d8-a1c0-f6107c108bbc",
    title: "Was she?",
    content:
      "if she wasn't your first childhood crush then you are not a man of culture (or a lesbian woman of culture)\n" +
      "\n" +
      "#riruru #doraemon",
    commentsCount: 6,
    isPublic: true,
    likes: ["3bf18e98-38b1-4a80-8e1f-695a162661fb"],
    dislikes: [],
    createdBy: {
      id: "3bf18e98-38b1-4a80-8e1f-695a162661fb",
      username: "Admin",
      password: "$2b$10$lrWnJ6X65MCkTVfSuBlaQ.VzllslMsNY9AXQeWBdSnFnUw8vjM3eq",
      avatar:
        "https://res.cloudinary.com/dvydarjuu/image/upload/v1752778811/uwn1z2uftnenss4tlghq.jpg",
      posts: [Array],
      friends: [Array],
      createdAt: "2025-06-22 17:59:20.810122",
      lastOnline: "2025-08-01 23:08:20.97",
      blockedUsers: [],
      accountType: "public",
      isDeactivated: false,
      deactivatedTill: null,
      isDeleted: false,
      receiveNotificationsForFriendRequest: true,
      receiveNotificationsForLike: true,
      receiveNotificationsForComment: true,
      receiveNotificationsForMention: null,
      receiveNotificationsForFriendPost: true,
      savedPosts: [Array],
    },
    createdAt: "2025-07-30 12:25:10.165853",
    savedCount: 1,
    image: [
      "https://res.cloudinary.com/dvydarjuu/image/upload/v1753878303/yfpikfoq4cffdkdoxo7i.jpg",
      "https://res.cloudinary.com/dvydarjuu/image/upload/v1753992446/qf5ab9l4n2dcetlxa6qr.jpg",
    ],
  },
  {
    id: "13880e63-fb8e-4c3e-af71-0bcbfa14362f",
    title: "hehehehehe",
    content: "",
    commentsCount: 4,
    isPublic: true,
    likes: ["c1cb8b40-04ff-47ec-ba22-4604be7f3cb6"],
    dislikes: ["3bf18e98-38b1-4a80-8e1f-695a162661fb"],
    createdBy: {
      id: "c1cb8b40-04ff-47ec-ba22-4604be7f3cb6",
      username: "nfornigga",
      password: "$2b$10$H7UfVG6b6mUdRwQ3Yx7Jou69Qfbx8RNEZgqG.cObVhmA2oPsrYDGK",
      avatar:
        "https://res.cloudinary.com/dvydarjuu/image/upload/v1750780140/fqc6oxbt3vtgtl6wi0m7.jpg",
      posts: [Array],
      friends: [Array],
      createdAt: "2025-06-24 15:49:14.540247",
      lastOnline: "2025-07-17 20:07:34.351",
      blockedUsers: [],
      accountType: "public",
      isDeactivated: false,
      deactivatedTill: null,
      isDeleted: false,
      receiveNotificationsForFriendRequest: true,
      receiveNotificationsForLike: true,
      receiveNotificationsForComment: true,
      receiveNotificationsForMention: null,
      receiveNotificationsForFriendPost: true,
      savedPosts: [Array],
    },
    createdAt: "2025-07-09 05:47:04.783916",
    savedCount: 0,
    image: [
      "https://res.cloudinary.com/dvydarjuu/image/upload/v1752040008/ln8ljxuydywjc255wyhy.jpg",
    ],
  },
  {
    id: "25afff6f-e1a7-4e02-ad34-4b4ac7f8dfcd",
    title: "...",
    content: "the two people mentioned in first one are renowned authors",
    commentsCount: 22,
    isPublic: true,
    likes: ["1b68eed4-313e-4f3c-bcb7-cbf3fc5c5691"],
    dislikes: ["3bf18e98-38b1-4a80-8e1f-695a162661fb"],
    createdBy: {
      id: "c1cb8b40-04ff-47ec-ba22-4604be7f3cb6",
      username: "nfornigga",
      password: "$2b$10$H7UfVG6b6mUdRwQ3Yx7Jou69Qfbx8RNEZgqG.cObVhmA2oPsrYDGK",
      avatar:
        "https://res.cloudinary.com/dvydarjuu/image/upload/v1750780140/fqc6oxbt3vtgtl6wi0m7.jpg",
      posts: [Array],
      friends: [Array],
      createdAt: "2025-06-24 15:49:14.540247",
      lastOnline: "2025-07-17 20:07:34.351",
      blockedUsers: [],
      accountType: "public",
      isDeactivated: false,
      deactivatedTill: null,
      isDeleted: false,
      receiveNotificationsForFriendRequest: true,
      receiveNotificationsForLike: true,
      receiveNotificationsForComment: true,
      receiveNotificationsForMention: null,
      receiveNotificationsForFriendPost: true,
      savedPosts: [Array],
    },
    createdAt: "2025-07-06 10:25:18.955936",
    savedCount: 1,
    image: [
      "https://res.cloudinary.com/dvydarjuu/image/upload/v1751797461/wxkz7g5il77ipqqdc9tr.jpg",
    ],
  },
  {
    id: "4a634930-a776-4573-a880-c90c2ae3c94d",
    title: "Kya haramkhor log hai bhai",
    content: "",
    commentsCount: 0,
    isPublic: true,
    likes: [
      "c1cb8b40-04ff-47ec-ba22-4604be7f3cb6",
      "3bf18e98-38b1-4a80-8e1f-695a162661fb",
    ],
    dislikes: [],
    createdBy: {
      id: "3bf18e98-38b1-4a80-8e1f-695a162661fb",
      username: "Admin",
      password: "$2b$10$lrWnJ6X65MCkTVfSuBlaQ.VzllslMsNY9AXQeWBdSnFnUw8vjM3eq",
      avatar:
        "https://res.cloudinary.com/dvydarjuu/image/upload/v1752778811/uwn1z2uftnenss4tlghq.jpg",
      posts: [Array],
      friends: [Array],
      createdAt: "2025-06-22 17:59:20.810122",
      lastOnline: "2025-08-01 23:08:20.97",
      blockedUsers: [],
      accountType: "public",
      isDeactivated: false,
      deactivatedTill: null,
      isDeleted: false,
      receiveNotificationsForFriendRequest: true,
      receiveNotificationsForLike: true,
      receiveNotificationsForComment: true,
      receiveNotificationsForMention: null,
      receiveNotificationsForFriendPost: true,
      savedPosts: [Array],
    },
    createdAt: "2025-07-04 10:53:59.632719",
    savedCount: 0,
    image: [
      "https://res.cloudinary.com/dvydarjuu/video/upload/v1751626428/sstxhz4xnpsf4fpp1bfg.mp4",
    ],
  },
  {
    id: "80396e93-4eee-4c28-9203-30cf9f2f3ee5",
    title: "New feature",
    content:
      "Now the dropdown for the theme picker on the navbar have 5-6 theme options that u can choose from!!",
    commentsCount: 12,
    isPublic: true,
    likes: ["3bf18e98-38b1-4a80-8e1f-695a162661fb"],
    dislikes: [],
    createdBy: {
      id: "3bf18e98-38b1-4a80-8e1f-695a162661fb",
      username: "Admin",
      password: "$2b$10$lrWnJ6X65MCkTVfSuBlaQ.VzllslMsNY9AXQeWBdSnFnUw8vjM3eq",
      avatar:
        "https://res.cloudinary.com/dvydarjuu/image/upload/v1752778811/uwn1z2uftnenss4tlghq.jpg",
      posts: [Array],
      friends: [Array],
      createdAt: "2025-06-22 17:59:20.810122",
      lastOnline: "2025-08-01 23:08:20.97",
      blockedUsers: [],
      accountType: "public",
      isDeactivated: false,
      deactivatedTill: null,
      isDeleted: false,
      receiveNotificationsForFriendRequest: true,
      receiveNotificationsForLike: true,
      receiveNotificationsForComment: true,
      receiveNotificationsForMention: null,
      receiveNotificationsForFriendPost: true,
      savedPosts: [Array],
    },
    createdAt: "2025-07-02 09:11:29.03954",
    savedCount: 0,
    image: [
      "https://res.cloudinary.com/dvydarjuu/image/upload/v1751447486/mwsustdwsvie5zgimxsz.png",
    ],
  },
  {
    id: "d0b6ce8a-6fd2-40c4-bd6a-38eb5332749e",
    title: "THIS ONE'S BETTER , I LIKE IT",
    content: "title pretty much",
    commentsCount: 4,
    isPublic: true,
    likes: [
      "1b68eed4-313e-4f3c-bcb7-cbf3fc5c5691",
      "c1cb8b40-04ff-47ec-ba22-4604be7f3cb6",
    ],
    dislikes: [],
    createdBy: {
      id: "1b68eed4-313e-4f3c-bcb7-cbf3fc5c5691",
      username: "polishcowmoo",
      password: "$2b$10$SJGM/IXgCnHoHoXrG36eYOXDK5dKrFhygNl5SV.p8epZXI2iLU2XS",
      avatar:
        "https://res.cloudinary.com/dvydarjuu/image/upload/v1750874274/dx4wqmnpoihyhswng2fs.gif",
      posts: [Array],
      friends: null,
      createdAt: "2025-06-25 17:58:01.19833",
      lastOnline: "2025-06-28 19:37:00.341",
      blockedUsers: [],
      accountType: "public",
      isDeactivated: false,
      deactivatedTill: null,
      isDeleted: false,
      receiveNotificationsForFriendRequest: true,
      receiveNotificationsForLike: true,
      receiveNotificationsForComment: true,
      receiveNotificationsForMention: null,
      receiveNotificationsForFriendPost: true,
      savedPosts: [Array],
    },
    createdAt: "2025-06-25 18:02:02.74419",
    savedCount: 0,
    image: [
      "https://res.cloudinary.com/dvydarjuu/image/upload/v1750874424/wfrrqi7lsmucpmqhvplf.jpg",
    ],
  },
  {
    id: "168582c1-8577-45d4-b549-a2cdcf6d2762",
    title: "Burn this guy alive",
    content:
      "Okay so some context this guy raped a girl who was 4 years and 3 months old.\n" +
      "The judge said this :)",
    commentsCount: 32,
    isPublic: true,
    likes: ["c1cb8b40-04ff-47ec-ba22-4604be7f3cb6"],
    dislikes: [],
    createdBy: {
      id: "3bf18e98-38b1-4a80-8e1f-695a162661fb",
      username: "Admin",
      password: "$2b$10$lrWnJ6X65MCkTVfSuBlaQ.VzllslMsNY9AXQeWBdSnFnUw8vjM3eq",
      avatar:
        "https://res.cloudinary.com/dvydarjuu/image/upload/v1752778811/uwn1z2uftnenss4tlghq.jpg",
      posts: [Array],
      friends: [Array],
      createdAt: "2025-06-22 17:59:20.810122",
      lastOnline: "2025-08-01 23:08:20.97",
      blockedUsers: [],
      accountType: "public",
      isDeactivated: false,
      deactivatedTill: null,
      isDeleted: false,
      receiveNotificationsForFriendRequest: true,
      receiveNotificationsForLike: true,
      receiveNotificationsForComment: true,
      receiveNotificationsForMention: null,
      receiveNotificationsForFriendPost: true,
      savedPosts: [Array],
    },
    createdAt: "2025-06-25 17:58:17.741081",
    savedCount: 0,
    image: [
      "https://res.cloudinary.com/dvydarjuu/image/upload/v1750874282/w9z8i9tm0lgnz8h8naho.jpg",
    ],
  },
  {
    id: "20e5a80f-2b3e-48aa-8d49-ceef6a366e79",
    title: "Niceee",
    content:
      "I looked arround here and there, the app is so good-looking first of all, the functioning is pretty smooth, and the overall like design is on point, good work admin!!",
    commentsCount: 35,
    isPublic: true,
    likes: [
      "3bf18e98-38b1-4a80-8e1f-695a162661fb",
      "c1cb8b40-04ff-47ec-ba22-4604be7f3cb6",
      "f0193534-3ab0-43d7-bc90-b4acf1a41354",
      "68a9efbc-f0ea-4641-a391-538f23b0ab85",
      "3bcab3fb-0af8-4a0c-9009-dc893070489b",
    ],
    dislikes: [],
    createdBy: {
      id: "3bcab3fb-0af8-4a0c-9009-dc893070489b",
      username: "Osamu dazai",
      password: "$2b$10$emwN5Mv3Q.igM3Bqj.FTve3uAOy/m.Me.8Ww3zVgpVUzdc8w6Y4Uq",
      avatar:
        "https://res.cloudinary.com/dvydarjuu/image/upload/v1750764772/oxewi5aggg5f0kjhuinq.jpg",
      posts: [Array],
      friends: [Array],
      createdAt: "2025-06-24 11:33:01.758503",
      lastOnline: "2025-07-26 15:20:36.622",
      blockedUsers: [],
      accountType: "public",
      isDeactivated: false,
      deactivatedTill: null,
      isDeleted: false,
      receiveNotificationsForFriendRequest: true,
      receiveNotificationsForLike: true,
      receiveNotificationsForComment: true,
      receiveNotificationsForMention: null,
      receiveNotificationsForFriendPost: true,
      savedPosts: [Array],
    },
    createdAt: "2025-06-24 11:39:07.799975",
    savedCount: 0,
    image: [
      "https://res.cloudinary.com/dvydarjuu/image/upload/v1750765144/maqqndze5h2nvuqiay6h.jpg",
    ],
  },
  {
    id: "fe043386-2f23-46dd-bbc9-bd08f012809a",
    title: "Hmmmm",
    content: "Niceee",
    commentsCount: 15,
    isPublic: true,
    likes: [
      "3bf18e98-38b1-4a80-8e1f-695a162661fb",
      "c1cb8b40-04ff-47ec-ba22-4604be7f3cb6",
    ],
    dislikes: [],
    createdBy: {
      id: "f0193534-3ab0-43d7-bc90-b4acf1a41354",
      username: "Akshara721",
      password: "$2b$10$ft0xoSVBC7PJHcffANbZs.FF5wVxxyS6U53bXiWpQHrNZjaEmcry6",
      avatar: null,
      posts: [Array],
      friends: null,
      createdAt: "2025-06-23 09:51:16.526777",
      lastOnline: "2025-07-02 05:44:09.626",
      blockedUsers: [],
      accountType: "public",
      isDeactivated: false,
      deactivatedTill: null,
      isDeleted: false,
      receiveNotificationsForFriendRequest: true,
      receiveNotificationsForLike: true,
      receiveNotificationsForComment: true,
      receiveNotificationsForMention: null,
      receiveNotificationsForFriendPost: true,
      savedPosts: [Array],
    },
    createdAt: "2025-06-23 09:51:50.540843",
    savedCount: 0,
    image: [""],
  },
  {
    id: "1c29c8f5-9c5d-420f-a7ec-8efc31ba4209",
    title: "First Post!!",
    content:
      "This app is better in terms of usability maintainability and ui as well.\n" +
      "The old thing was a mess.\n" +
      "But mai probably kuchh features bhool gya hounga, to if u want some features tell me i will make them!!",
    commentsCount: 20,
    isPublic: true,
    likes: [],
    dislikes: ["c1cb8b40-04ff-47ec-ba22-4604be7f3cb6"],
    createdBy: {
      id: "3bf18e98-38b1-4a80-8e1f-695a162661fb",
      username: "Admin",
      password: "$2b$10$lrWnJ6X65MCkTVfSuBlaQ.VzllslMsNY9AXQeWBdSnFnUw8vjM3eq",
      avatar:
        "https://res.cloudinary.com/dvydarjuu/image/upload/v1752778811/uwn1z2uftnenss4tlghq.jpg",
      posts: [Array],
      friends: [Array],
      createdAt: "2025-06-22 17:59:20.810122",
      lastOnline: "2025-08-01 23:08:20.97",
      blockedUsers: [],
      accountType: "public",
      isDeactivated: false,
      deactivatedTill: null,
      isDeleted: false,
      receiveNotificationsForFriendRequest: true,
      receiveNotificationsForLike: true,
      receiveNotificationsForComment: true,
      receiveNotificationsForMention: null,
      receiveNotificationsForFriendPost: true,
      savedPosts: [Array],
    },
    createdAt: "2025-06-22 18:00:28.200565",
    savedCount: 0,
    image: [
      "https://res.cloudinary.com/dvydarjuu/image/upload/v1750615224/bykxt4lno5uoqg9ogj74.jpg",
    ],
  },
];

export default function CommunityPage() {
  const { user } = useGetUser();
  const [isJoined, setIsJoined] = useState(communityData.isJoined);
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  return (
    <div className="relative flex h-screen w-full flex-col gap-3 overflow-x-hidden px-2 py-2">
      <Navbar />
      {/* Header */}
      <div className="border-b">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="p-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <Avatar className="border-border h-8 w-8 border-2">
                <AvatarImage src={communityData.avatar || "/placeholder.svg"} />
                <AvatarFallback>{communityData.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <span className="font-semibold">{communityData.name}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Banner */}
      <div className="relative">
        {communityData.banner.length > 0 ? (
          <div className="relative h-48 overflow-hidden bg-gradient-to-r">
            <Image
              src={communityData.banner || "/placeholder.svg"}
              alt=""
              fill
              className="object-cover opacity-80"
            />
          </div>
        ) : (
          <div className="from-primary via-primary/90 to-primary/60 relative h-48 overflow-hidden bg-gradient-to-r">
            <div className="absolute inset-0 bg-black/20"></div>
          </div>
        )}

        {/* Community Info */}
        <div className="mx-auto max-w-6xl px-4">
          <Card className="relative -mt-20 mb-8 rounded-2xl border p-8 shadow-xl">
            <div className="flex items-start gap-6">
              <div className="relative">
                <Avatar className="border-border h-24 w-24 border-4 shadow-lg">
                  <AvatarImage
                    src={communityData.avatar || "/placeholder.svg"}
                  />
                  <AvatarFallback>
                    {communityData.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="flex-1">
                <div className="mb-4 flex flex-col items-start justify-between md:flex-row">
                  <div>
                    <h1 className="mb-1 text-3xl font-bold">
                      {communityData.name}
                    </h1>
                    <p className="text-muted-foreground mb-2">
                      @{communityData.handle}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm">
                      <Share className="mr-2 h-4 w-4" />
                      Share
                    </Button>
                    <Button onClick={() => setIsJoined(!isJoined)}>
                      {isJoined ? "Following" : "Follow"}
                    </Button>
                  </div>
                </div>

                <p className="text-muted-foreground mb-4 leading-relaxed">
                  {communityData.description}
                </p>

                <div className="flex flex-wrap items-center gap-8 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span className="font-semibold">
                      {formatNumber(communityData.members)}
                    </span>
                    <span>members</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
                    <span className="font-semibold text-green-600">
                      {formatNumber(communityData.online)}
                    </span>
                    <span>online</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Since {new Date(communityData.created).getFullYear()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Posts Tabs */}
            <Tabs defaultValue="trending" className="mb-6">
              <TabsList className="rounded-xl border p-1 shadow-sm">
                <TabsTrigger
                  value="trending"
                  className="data-[state=active]:bg-secondary flex items-center gap-2"
                >
                  <Flame className="h-4 w-4" />
                  Trending
                </TabsTrigger>
                <TabsTrigger
                  value="recent"
                  className="data-[state=active]:bg-secondary flex items-center gap-2"
                >
                  <Clock className="h-4 w-4" />
                  Recent
                </TabsTrigger>
                <TabsTrigger
                  value="popular"
                  className="data-[state=active]:bg-secondary flex items-center gap-2"
                >
                  <TrendingUp className="h-4 w-4" />
                  Popular
                </TabsTrigger>
              </TabsList>

              <TabsContent value="trending" className="mt-6 space-y-3">
                {posts.map((post) => (
                  <PostCard
                    avatar={post.createdBy?.avatar ?? ""}
                    username={post.createdBy?.username ?? "User"}
                    authorId={post.createdBy?.id ?? ""}
                    title={post.title}
                    image={post.image}
                    createdAt={new Date(post.createdAt)}
                    content={post.content}
                    id={post.id}
                    likes={post.likes ?? []}
                    disLikes={post.dislikes ?? []}
                    loggedInUserId={user.id}
                    loggedInUserUsername={user.username}
                    key={post.id}
                    savedCount={post.savedCount}
                  />
                ))}
              </TabsContent>

              <TabsContent value="recent" className="mt-6 space-y-3">
                {posts
                  .slice()
                  .reverse()
                  .map((post) => (
                    <PostCard
                      avatar={post.createdBy?.avatar ?? ""}
                      username={post.createdBy?.username ?? "User"}
                      authorId={post.createdBy?.id ?? ""}
                      title={post.title}
                      image={post.image}
                      createdAt={new Date(post.createdAt)}
                      content={post.content}
                      id={post.id}
                      likes={post.likes ?? []}
                      disLikes={post.dislikes ?? []}
                      loggedInUserId={user.id}
                      loggedInUserUsername={user.username}
                      key={post.id}
                      savedCount={post.savedCount}
                    />
                  ))}
              </TabsContent>

              <TabsContent value="popular" className="mt-6 space-y-3">
                {posts
                  .slice()
                  .sort((a, b) => b.likes.length - a.likes.length)
                  .map((post) => (
                    <PostCard
                      avatar={post.createdBy?.avatar ?? ""}
                      username={post.createdBy?.username ?? "User"}
                      authorId={post.createdBy?.id ?? ""}
                      title={post.title}
                      image={post.image}
                      createdAt={new Date(post.createdAt)}
                      content={post.content}
                      id={post.id}
                      likes={post.likes ?? []}
                      disLikes={post.dislikes ?? []}
                      loggedInUserId={user.id}
                      loggedInUserUsername={user.username}
                      key={post.id}
                      savedCount={post.savedCount}
                    />
                  ))}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="sticky top-24 h-screen space-y-6">
            {/* About */}
            <Card className="border-0 py-6 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold">
                  About this community
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {communityData.longDescription}
                </p>

                <Separator />

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-muted-foreground text-2xl font-bold">
                      {formatNumber(communityData.members)}
                    </div>
                    <div className="text-muted-foreground/60 text-xs tracking-wide uppercase">
                      Members
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {formatNumber(communityData.online)}
                    </div>
                    <div className="text-muted-foreground/60 text-xs tracking-wide uppercase">
                      Online
                    </div>
                  </div>
                </div>

                <Button className="w-full">Create Post</Button>
              </CardContent>
            </Card>

            {/* Community Guidelines */}
            <Card className="border-0 py-6 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                  <Crown className="h-5 w-5 text-yellow-500" />
                  Community Guidelines
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {communityData.guidelines.map((guideline, index) => (
                    <div key={index} className="flex gap-3 text-sm">
                      <span className="min-w-0 font-semibold text-purple-500">
                        {index + 1}.
                      </span>
                      <span>{guideline}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Moderators */}
            <Card className="border-0 py-6 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold">
                  Community Team
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {communityData.moderators.map((mod, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={mod.avatar || "/placeholder.svg"} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-400 text-xs text-white">
                          {mod.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{mod.name}</div>
                        <div className="text-muted-foreground text-xs">
                          @{mod.username} • {mod.role}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
