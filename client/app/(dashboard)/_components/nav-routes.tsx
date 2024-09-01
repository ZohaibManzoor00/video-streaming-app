"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthContext } from "@/context/authContext";
import { upperCaseFirstChar } from "@/lib/utils";

interface Route {
  href: string;
  name: string;
}

const navRoutes = [
  { href: "/features", name: "features" },
  { href: "/courses", name: "courses" },
  { href: "/learn", name: "learn" },
  { href: "/blogs", name: "blogs" },
];

export default function NavRoutes() {
  const pathname = usePathname();
  const { user } = useAuthContext();

  return (
    <>
      <ul className="gap-x-5 flex">
        {navRoutes.map((route: Route) => (
          <li
            key={route.href}
            className={pathname === route.href ? "text-lg" : "opacity-60"}
          >
            {user && route.href === "/" ? (
              <Link href="/dashboard" className="cursor-hover">
                Dashboard
              </Link>
            ) : (
              <Link href={route.href} className="cursor-hover">
                {upperCaseFirstChar(route.name)}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}
