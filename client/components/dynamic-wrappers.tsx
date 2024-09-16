"use client";

import { useTheme } from "@/context/themeContext";
import { cn } from "@/lib/utils";

type DynamicProps = {
  children: Readonly<React.ReactNode>;
  styles?: string;
};

export function DynamicBorder({ children, styles }: DynamicProps) {
  const { secondary } = useTheme();

  return (
    <div
      className={cn(
        `border-2 border-secondary-${secondary} rounded-sm`,
        styles
      )}
    >
      {children}
    </div>
  );
}

type DynamicButtonProps = DynamicProps & {
  buttonType?: "normal" | "cta";
};

export function DynamicButton({
  children,
  styles,
  buttonType,
}: DynamicButtonProps) {
  const { primary, secondary } = useTheme();

  const needsBlackText = ["slate", "pink"].includes(secondary);

  return (
    <div
      className={cn(
        `text-lg ${needsBlackText && "text-black"}`,
        buttonType === "cta"
          ? `bg-secondary-${secondary}`
          : `bg-primary-${primary}`,
        styles
      )}
    >
      {children}
    </div>
  );
}

export function DynamicText({ children, styles }: DynamicProps) {
  const { secondary } = useTheme(); // doesn't pick up change on initial color
  return <p className={`text-secondary-${secondary}`}>{children}</p>;
}
