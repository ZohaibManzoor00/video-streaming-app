"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { signOut, signInWithGoogle } from "@/firebase/firebase";
import { useAuthContext } from "@/context/authContext";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./ui/button";

export default function SignInOut() {
  const { user, loading } = useAuthContext();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  if (loading) return <div>Loading...</div>; // TODO: Pulse load image

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
      // router.push("/dashboard");
    } catch (err: any) {
      setError("Failed to sign in. Please try again." + err);
    }
  };

  return (
    <>
      {user ? (
        <>
          <button className="text-white" onClick={signOut}>
            <Image
              src={user.photoURL || ""}
              alt="User image"
              width={35}
              height={35}
              className="rounded-full"
            />
          </button>
        </>
      ) : (
        <>
          <button
            className={cn(
              buttonVariants({ variant: "secondary" }),
              "mr-6 text-sm"
            )}
          >
            Join Now
          </button>
          <button className="text-white opacity-70" onClick={handleSignIn}>
            Login
          </button>
        </>
      )}
    </>
  );
}
