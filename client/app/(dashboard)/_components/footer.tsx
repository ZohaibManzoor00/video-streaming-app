"use client";

import { useAuthContext } from "@/context/authContext";
import { upperCaseFirstChar } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Route = {
  href: string;
  name: string;
};

const navRoutes = [
  { href: "/features", name: "features" },
  { href: "/courses", name: "courses" },
  { href: "/learn", name: "learn" },
  { href: "/blogs", name: "blogs" },
  { href: "/login", name: "Join Now" },
];

export default function Footer() {
  const pathname = usePathname();
  const { user } = useAuthContext();

  return (
    <div className="bg-black w-full">
      <div className="pt-16 max-w-6xl mx-auto">
        <div className="text-white text-2xl">The Marcy Lab School</div>
        <div className="flex items-center justify-between">
          <ul className="flex gap-x-5 my-4">
            {navRoutes.map((route: Route) => (
              <li
                key={route.href}
                className={`text-white ${
                  pathname === route.href ? "text-lg" : "opacity-60"
                }`}
              >
                {user && route.href === pathname ? (
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
          <div className="text-white opacity-60 font-light">
            {/* TODO: Customize email if want */}
            <a href="mailto:support@themarcylabschool.com?subject=Hello&body=I%20would%20like%20to%20discuss...">
              Contact: support@themarcylabschool.com
            </a>
          </div>
        </div>
        <div className="h-[2px] w-full bg-stone-600" />
        <div className="text-white opacity-60 font-light text-sm my-4 flex justify-between">
          <p>
            The Mary Lab School is proudly founded and located in Brooklyn, NY
          </p>
          <p>©2024 The Marcy Lab School · Terms of Service · Privacy Policy</p>
        </div>
        <div className="h-10" />
      </div>
    </div>
  );
}
