import MobileSidebar from "./mobile-sidebar";
import NavbarRoutes from "./navbar-routes";

export default function Navbar() {
  return (
    <div className="flex w-full items-center mx-auto">
      <NavbarRoutes />
      <MobileSidebar />
    </div>
  );
}
