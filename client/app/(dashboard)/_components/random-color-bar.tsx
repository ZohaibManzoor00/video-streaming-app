"use client"

import { useTheme } from "@/context/themeContext";

export default function NavSecondaryColorBar() {
  const { secondary } = useTheme();

  return <div className={`h-[2px] border border-secondary-${secondary}`} />;
}
