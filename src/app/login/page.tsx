import SignIn from "../../components/sign-in";

export default function SignInPage() {
  return (
    <main className="flex min-h-screen w-screen items-center justify-center">
      <div className="flex min-w-full justify-center lg:pr-[32rem]">
        <SignIn />
      </div>
    </main>
  );
}
