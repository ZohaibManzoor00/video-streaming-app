import NavbarRoutes from "@/components/navbar-routes";
import MobileSidebar from "./mobile-sidebar";

export default function Navbar() {
  return (
    <div className="flex w-full items-center mx-auto">
      <NavbarRoutes />
      <MobileSidebar />
    </div>
  );
}
