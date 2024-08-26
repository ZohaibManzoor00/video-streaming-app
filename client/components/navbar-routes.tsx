"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "./ui/button";
import { LogOut } from "lucide-react";
import DarkModeToggler from "./dark-mode-toggler";
// import SearchInput from "./search-input";
import { isTeacher } from "@/lib/teacher";
import useAuth from "@/app/hooks/useAuth";
import SignIn from "./sign-in";
import UploadVideo from "@/app/_components/upload-video";

export default function NavbarRoutes() {
  const { user } = useAuth();
  const pathname = usePathname();

  const isTeacherPage = pathname?.startsWith("/teacher");
  const isCoursePage = pathname?.includes("/courses");
  const isPathwayPage = pathname?.startsWith("/pathways");
  const isDashboard = pathname === "/";

  return (
    <>
      {(isPathwayPage || isDashboard) && (
        <div className="hidden md:block">{/* <SearchInput /> */}Search...</div>
      )}
      <div className="flex gap-x-2 ml-auto items-center">
        {isTeacherPage || isCoursePage ? (
          <Link href="/">
            <Button className="sm" variant="ghost">
              <LogOut className="h-4 mr-2 w-4" />
              Exit
            </Button>
          </Link>
        ) : isTeacher() ? (
          <Link href="/teacher/courses">
            <Button className="sm" variant="ghost">
              Teacher Mode
            </Button>
          </Link>
        ) : null}
        {user && <UploadVideo />}
        <DarkModeToggler />
        <div className="mt-1">
          <SignIn user={user} />
        </div>
      </div>
    </>
  );
}
