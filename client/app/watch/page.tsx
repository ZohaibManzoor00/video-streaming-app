'use client'

import { useState, useEffect } from "react";
import SignIn from "../_components/sign-in";
import { onAuthStateChangedHelper } from "../_firebase/firebase";
import { User } from "firebase/auth";

export default function Watch() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChangedHelper(user => {
        setUser(user)
    })

    return () => unsubscribe()
  }, [])

  return (
    <>
      <SignIn user={user}/>
      <div>This is the watch page</div>
    </>
  );
}
