"use client";

import Navbar from "@/components/navbar";
import { Loader } from "@/components/loader";
import { Suspense } from "react";
import { Search } from "./search";

export default function SaerchPage() {
  return (
    <main className="bg-background px-2 py-2">
      <Navbar />
      <div className="container mx-auto max-w-2xl p-4">
        <div className="mb-6">
          <h1 className="mt-2 mb-6 text-xl font-normal md:text-2xl">
            Search Users
          </h1>
          <Suspense fallback={<Loader />}>
            <Search />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
