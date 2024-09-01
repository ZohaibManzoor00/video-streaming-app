import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
// import Sidebar from "./sidebar";

export default function MobileSidebar() {
  return (
    <Sheet>
      <SheetTrigger className="md:hidden pr-4 hover:opacity-75">
        <Menu />
      </SheetTrigger>
      <SheetContent
        side="top"
        className="p-0 mt-10"
        style={{
          transition: "none",
          transform: "none",
          animation: "none",
        }}
      >
        {/* <Sidebar /> TODO: Add mobile sidebar component */}
      </SheetContent>
    </Sheet>
  );
}
