import Link from "next/link";
import SignInOut from "./sign-in";
import NavRoutes from "./nav-routes";
import NavSecondaryColorBar from "./random-color-bar";
import ThemeSelector from "./theme-selector";
import { SearchIcon } from "lucide-react";

export default function NavbarRoutes() {
  return (
    <div className="w-full text-white">
      <div className="max-w-6xl m-auto flex items-center h-16 px-3">
        <Link href="/" className="cursor-hover text-white text-2xl">
          Fullstack Marcy
        </Link>
        <div className="flex items-center ml-10">
          <NavRoutes />
        </div>
        <div className="flex gap-x-2 items-center ml-auto">
          <SearchIcon className="mr-2" />
          <ThemeSelector />
          <SignInOut />
        </div>
      </div>
      <NavSecondaryColorBar />
    </div>
  );
}
