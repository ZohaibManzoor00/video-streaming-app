"use client";

import { signOut, signInWithGoogle } from "@/firebase/firebase";
import { useState } from "react";
import { useAuthContext } from "@/context/authContext";
import Image from "next/image";
import { useTheme } from "@/context/themeContext";
import { useRouter } from "next/navigation";

export default function SignInOut() {
  const { user, loading } = useAuthContext();
  const { secondary } = useTheme();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  if (loading) return <div>Loading...</div>; // TODO: Pulse load image

  const needsDarkText = ["slate", "pink", "yellow"];

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
      router.push("/dashboard");
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
            className={`bg-secondary-${secondary} rounded-full py-3 px-6 text-sm mr-2 min-w-28 ${
              needsDarkText.includes(secondary) ? "text-black" : "text-white"
            }`}
          >
            Join Now
          </button>
          <button className="text-white opacity-70" onClick={handleSignIn}>
            {error ? "Try Again?" : "Login"}
          </button>
        </>
      )}
    </>
  );
}
