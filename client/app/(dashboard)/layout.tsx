"use client";

import Navbar from "./_components/navbar";
import { AuthProvider } from "@/context/authContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col items-center">
        <Navbar />
        <main className="max-w-6xl mt-10">{children}</main>
      </div>
    </AuthProvider>
  );
}
