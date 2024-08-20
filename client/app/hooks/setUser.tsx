'use client'

import { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { onAuthStateChangedHelper } from "../firebase/firebase";

export default function useUser() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChangedHelper((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  return { user, setUser };
}
