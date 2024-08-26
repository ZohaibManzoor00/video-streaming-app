"use client";

import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface SideBarItemProps {
  icon: LucideIcon;
  label: string;
  href: string;
}

export default function SidebarItem({
  icon: Icon,
  label,
  href,
}: SideBarItemProps) {
  const pathname = usePathname();
  const router = useRouter();

  const isActive =
    (pathname === "/" && href === "/") ||
    pathname === href ||
    pathname?.startsWith(`${href}/`);

  const onClick = () => router.push(href);

  return (
    <>
      <button
        onClick={onClick}
        type="button"
        className={cn( 
          `flex items-center gap-x-2 text-slate-500 dark:text-gray-400 text-sm font-[500] pl-6 transition-all hover:bg-slate-300/20 dark:hover:bg-blue-600`,
          isActive &&
            "text-zinc-700 dark:text-gray-100 bg-zinc-200/20 dark:bg-blue-900 hover:bg-zinc-200/20 hover:text-zinc-700"
        )}
      >
        <div className="flex items-center gap-x-2 py-4">
          <Icon
            size={22}
            className={cn(
              "text-slate-500",
              isActive && "text-zinc-700 dark:text-gray-200"
            )}
          />
          {label}
        </div>
      </button>
    </>
  );
}
