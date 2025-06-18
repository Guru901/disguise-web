import SignUp from "./components/sign-up";

export default async function Home() {
  return (
    <main className="flex min-h-screen w-screen items-center justify-center">
      <div className="flex w-[50vw] justify-center">
        <SignUp />
      </div>
    </main>
  );
}
