"use client";

import Link from "next/link";
import useUser from "../hooks/setUser";
import SignIn from "./sign-in";
import UploadVideo from "./upload-video";

export default function Navbar() {
  const { user } = useUser();

  return (
    <nav>
      <div className="flex justify-between bg-red-900 p-5">
        <Link href={"/"} className="text-white font-semibold">Marcy Learn</Link>
        <div className="flex gap-5">
          {user && <UploadVideo />}
          <SignIn user={user} />
        </div>
      </div>
    </nav>
  );
}
