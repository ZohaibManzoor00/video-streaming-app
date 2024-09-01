import Navbar from "./_components/navbar";

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {

  return (
    <div className={`min-h-screen flex flex-col items-center`}>
      <Navbar />
      <main className="w-full">{children}</main>
    </div>
  );
}
