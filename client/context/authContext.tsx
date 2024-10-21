"use client";

import React, { createContext, useContext } from "react";
import { User } from "firebase/auth";
import useAuth from "@/hooks/useAuth";

const AuthContext = createContext<{ user: User | null; loading: boolean }>({
  user: null,
  loading: true,
});

export const AuthProvider = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  const auth = useAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => useContext(AuthContext);
