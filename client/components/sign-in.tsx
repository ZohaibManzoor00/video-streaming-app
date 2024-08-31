"use client";

import Image from "next/image";
import { signInWithGoogle, signOut } from "../app/firebase/firebase";
import { useAuthContext } from "@/context/authContext";

export default function SignInOut() {
  const { user, loading } = useAuthContext();

  if (loading) return <div>Loading...</div>;

  return (
    <>
      {user ? (
        <>
          <button className="text-white" onClick={signOut}>
            <Image
              src={user.photoURL || ""}
              alt="User image"
              width={50}
              height={50}
              className="rounded-full"
            />
          </button>
        </>
      ) : (
        <>
          <button className="bg-emerald-600 rounded-full py-3 px-6 text-sm mr-2">
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
