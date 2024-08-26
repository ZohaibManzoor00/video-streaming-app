import NavbarRoutes from "@/components/navbar-routes";
import MobileSidebar from "./mobile-sidebar";

export default function Navbar() {
  return (
    <div className="p-4 h-full flex items-center bg-white dark:bg-inherit">
      <MobileSidebar />
      <NavbarRoutes />
    </div>
  );
}
