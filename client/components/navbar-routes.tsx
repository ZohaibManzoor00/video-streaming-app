import Link from "next/link";
import SignInOut from "./sign-in";
import NavRoutes from "./nav-routes";
import NavSecondaryColorBar from "./random-color-bar";
import { SearchIcon } from "lucide-react";

export default function NavbarRoutes() {
  return (
    <div className="w-full text-slate-100">
      <div className="max-w-7xl m-auto flex items-center h-16 px-6">
        <Link href="/" className="cursor-hover text-slate-100 text-2xl">
          Fullstack Marcy
        </Link>
        <div className="flex items-center ml-10">
          <NavRoutes />
        </div>
        <div className="flex gap-x-2 items-center ml-auto">
          <SearchIcon className="mr-2" />
          <SignInOut />
        </div>
      </div>
      <NavSecondaryColorBar />
    </div>
  );
}
