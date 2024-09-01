"use client";

import Image from "next/image";
import { useAuthContext } from "@/context/authContext";
import { useTheme } from "@/context/themeContext";
import { signOut, signInWithGoogle } from "@/app/firebase/firebase";

export default function SignInOut() {
  const { user, loading } = useAuthContext();
  const { secondary } = useTheme();

  if (loading) return <div>Loading...</div>;

  const needsDarkText = ["slate", "pink", "yellow"];

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
          <button className="text-white opacity-70" onClick={signInWithGoogle}>
            Login
          </button>
        </>
      )}
    </>
  );
}
