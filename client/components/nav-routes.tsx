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
        {navRoutes.map(({ href, name }: Route) => (
          <li
            key={href}
            className={pathname === href ? "opacity-100" : "opacity-60"}
          >
            
              <Link href={href} className="cursor-hover">
                {upperCaseFirstChar(name)}
              </Link>
          
          </li>
        ))}
      </ul>
    </>
  );
}
