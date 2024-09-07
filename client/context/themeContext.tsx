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
  const [primary, setPrimary] = useState<string>("slate");
  const [secondary, setSecondary] = useState<string>("green");

  useEffect(() => {
    const storedPrimary = localStorage.getItem("primaryColor");
    const storedSecondary = localStorage.getItem("secondaryColor");

    if (storedPrimary && storedPrimary !== primary && validColors.includes(storedPrimary))setPrimary(storedPrimary);
    if (storedSecondary && storedSecondary !== primary && validColors.includes(storedSecondary))setPrimary(storedSecondary);
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

  return (
    <ThemeContext.Provider
      value={{ primary, secondary, setPrimary, setSecondary }}
    >
      <div className={`bg-primary-${primary} border-secondary-${secondary}`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
