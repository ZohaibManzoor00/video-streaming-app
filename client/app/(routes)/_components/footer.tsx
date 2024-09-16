import Link from "next/link";
import NavRoutes from "./nav-routes";

export default function Footer() {
  return (
    <div className="bg-black w-full mt-auto">
      <div className="pt-16 mx-auto max-w-7xl px-6">
        <Link href="/" className="cursor-hover text-white text-2xl">
          The Marcy Lab School
        </Link>
        <div className="flex items-center justify-between">
          <ul className="flex gap-x-5 my-4 text-white">
            <NavRoutes />
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
