import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <SignIn
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "rounded-xl shadow-lg",
            headerTitle: "text-zinc-900",
            headerSubtitle: "text-zinc-500",
            formButtonPrimary:
              "bg-orange-500 hover:bg-orange-600 text-white rounded-lg",
            footerActionLink: "text-orange-600 hover:text-orange-700",
          },
        }}
      />
    </div>
  );
}
