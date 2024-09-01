"use client";

import { useTheme } from "@/context/themeContext";
import { cn } from "@/lib/utils";

const needsBlackText = ["slate", "pink"];

type CallToActionButtonsProps = {
  priorityStyles?: string;
};

export default function CallToActionButtons({
  priorityStyles,
}: CallToActionButtonsProps) {
  const { primary, secondary } = useTheme();

  return (
    <div className={cn("flex gap-x-6 w-full justify-center", priorityStyles)}>
      <button
        className={`bg-primary-${primary} min-w-56 rounded-full py-3 px-6 text-lg`}
      >
        Browse Courses
      </button>
      <button
        className={`bg-secondary-${secondary} min-w-56 rounded-full py-3 px-6 text-lg ${
          needsBlackText.includes(secondary) ? "text-black" : "text-white"
        }`}
      >
        View Learning Paths
      </button>
    </div>
  );
}
