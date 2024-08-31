import Link from "next/link";
import DarkModeToggler from "./dark-mode-toggler";
import SignInOut from "./sign-in";
import { upperCaseFirstChar } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useAuthContext } from "@/context/authContext";
import { SearchIcon } from "lucide-react";

interface Route {
  href: string;
  name: string;
}

const routes = [
  { href: "/features", name: "features" },
  { href: "/courses", name: "courses" },
  { href: "/learn", name: "learn" },
  { href: "/blogs", name: "blogs" },
];

export default function NavbarRoutes() {
  const pathname = usePathname();
  const { user } = useAuthContext();

  return (
    <div className="w-full bg-emerald-900">
      <div className="max-w-6xl m-auto flex items-center h-16 px-3">
        <p className="text-2xl font">Full Stack Marcy</p>
        <div className="flex items-center ml-16">
          {routes.map((route: Route) => (
            <ul key={route.href} className="mx-5">
              <li
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
            </ul>
          ))}
        </div>
        <div className="flex gap-x-2 items-center ml-auto">
          <SearchIcon className="mr-2"/>
          <SignInOut />
        </div>
      </div>
      <div className="bg-lime-700 h-[3px]" />
    </div>
  );
}
