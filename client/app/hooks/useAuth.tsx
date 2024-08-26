"use client";

import { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { onAuthStateChangedHelper } from "../firebase/firebase";

export default function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChangedHelper((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, loading };
}
