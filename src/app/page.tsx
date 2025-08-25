import SignUp from "../components/sign-up";

export default function SignUpPage() {
  return (
    <main className="flex w-screen items-center justify-center justify-self-end md:min-h-screen">
      <div className="mx-2 flex min-w-[50vw] justify-center">
        <SignUp />
      </div>
    </main>
  );
}
