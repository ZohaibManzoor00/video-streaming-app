"use client";

import { useTheme } from "@/context/themeContext";

const needsBlackText = ["slate", "pink"];

export default function CallToActionButtons() {
  const { primary, secondary } = useTheme();

  return (
    <div className="flex gap-x-6 w-full justify-center">
      <button
        className={`bg-primary-${primary} min-w-52 rounded-full py-3 px-6 text-lg font-thin`}
      >
        Browse Courses
      </button>
      <button
        className={`bg-secondary-${secondary} min-w-52 rounded-full py-3 px-6 text-lg font-thin ${
          needsBlackText.includes(secondary) ? "text-black" : "text-white"
        }`}
      >
        View Learning Paths
      </button>
    </div>
  );
}
