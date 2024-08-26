import Link from "next/link";

import SidebarRoutes from "./sidebar-routes";
// import Logo from "./logo";
import { WholeWord } from "lucide-react";

const socials = [
  {
    icon: WholeWord,
    href: "https://www.marcylabschool.org/",
    label: "Marcy Website",
  },
  {
    icon: WholeWord,
    href: "https://github.com/The-Marcy-Lab-School/",
    label: "Github",
  },
  {
    icon: WholeWord,
    href: "https://www.notion.so/marcylabschool/Getting-Started/",
    label: "Notion",
  },
  {
    icon: WholeWord,
    href: "https://www.linkedin.com/school/marcylabschool/mycompany/",
    label: "LinkedIn",
  },
  {
    icon: WholeWord,
    href: "https://www.instagram.com/marcylabschool/",
    label: "Instagram",
  },
];

export default function Sidebar() {
  return (
    <div className="h-full flex flex-col overflow-y-auto">
      <div className="p-6 flex items-center gap-1">
        {/* <Logo /> */}
        <Link href="/" className="cursor">
          <h1 className="font-semibold text-lg">Marcy Lab {" </>"}</h1>
        </Link>
      </div>
      <div className="flex flex-col w-full">
        <SidebarRoutes />
      </div>
      <div className="flex flex-col w-full pt-10 pb-4 mt-auto mb-2">
        <div className="container px-4 text-sm md:px-6">
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              {socials.map(({ href, icon: Icon, label }) => (
                <Link
                  key={href}
                  className="rounded-full flex h-6 w-6 items-center justify-center border border-gray-200 hover:border-gray-200 hover:bg-gray-200 dark:border-gray-800 dark:hover:bg-gray-800 dark:hover:border-gray-800"
                  href={href}
                  target="_blank"
                >
                  <Icon className="w-4 h-4 full" />
                  <span className="sr-only">{label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
