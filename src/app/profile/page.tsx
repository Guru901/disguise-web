import SignIn from "@/app/components/sign-in";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import LogOut from "../components/log-out";

export default async function Home() {
  const session = await auth.api.getSession({ headers: await headers() });
  return (
    <main>
      {session ? (
        <>
          <p>Hello {session.user.email}</p>
          <LogOut />
        </>
      ) : (
        <SignIn />
      )}
    </main>
  );
}
