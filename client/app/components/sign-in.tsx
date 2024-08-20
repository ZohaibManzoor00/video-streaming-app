"use client";

import { User } from "firebase/auth";
import { signInWithGoogle, signOut } from "../firebase/firebase";

interface SignInProps {
  user: User | null;
}

export default function SignIn({ user }: SignInProps) {
  return (
    <>
      {user ? (
        <button className="text-white" onClick={signOut}>Sign Out</button>
      ) : (
        <button className="text-white" onClick={signInWithGoogle}>Sign In</button>
      )}
    </>
  );
}
