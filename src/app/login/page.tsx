import SignIn from "../../components/sign-in";

export default function SignInPage() {
  return (
    <main className="flex h-svh w-screen items-center justify-center md:min-h-screen">
      <div className="mx-2 flex min-w-[50vw] justify-center lg:pr-[32rem]">
        <SignIn />
      </div>
    </main>
  );
}
