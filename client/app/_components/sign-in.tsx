"use client";

import { User } from "firebase/auth";
import { signInWithGoogle, signOut } from "../_firebase/firebase";

interface SignInProps {
  user: User | null;
}

export default function SignIn({ user }: SignInProps) {
  return (
    <>
      {user ? (
        <button onClick={signOut}>Sign Out</button>
      ) : (
        <button onClick={signInWithGoogle}>Sign In</button>
      )}
    </>
  );
}
