import { Suspense } from "react";
import Profile from "./me";
import Navbar from "@/components/navbar";
import { Loader } from "@/components/loader";

export default function Me() {
  return (
    <main className="flex flex-col gap-2 px-2 py-2">
      <Navbar />
      <Suspense fallback={<Loader />}>
        <Profile />
      </Suspense>
    </main>
  );
}
