"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  memo,
} from "react";

type ThemeContextProps = {
  primary: string;
  secondary: string;
  setPrimary: (primary: string) => void;
  setSecondary: (secondary: string) => void;
};

const validColors = ["slate", "green", "yellow", "orange", "pink", "blue"];

const ThemeContext = createContext<ThemeContextProps>({
  primary: "slate",
  secondary: "green",
  setPrimary: () => {},
  setSecondary: () => {},
});

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [primary, setPrimary] = useState<string | null>(null);
  const [secondary, setSecondary] = useState<string | null>(null);

  useEffect(() => {
    const storedPrimary = localStorage.getItem("primaryColor") || "slate";
    const storedSecondary = localStorage.getItem("secondaryColor") || "green";

    if (!validColors.includes(storedPrimary))
      localStorage.setItem("primaryColor", "slate");
    if (!validColors.includes(storedSecondary))
      localStorage.setItem("secondaryColor", "green");

    setPrimary(storedPrimary || "slate");
    setSecondary(storedSecondary || "green");
  }, []);

  useEffect(() => {
    if (primary && validColors.includes(primary)) {
      localStorage.setItem("primaryColor", primary);
    }
  }, [primary]);

  useEffect(() => {
    if (secondary && validColors.includes(secondary))
      localStorage.setItem("secondaryColor", secondary);
  }, [secondary]);

  if (!primary || !secondary) return null;

  return (
    <ThemeContext.Provider
      value={{ primary, secondary, setPrimary, setSecondary }}
    >
      <div className={`bg-primary-${primary} border-secondary-${secondary}`}>{children}</div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
