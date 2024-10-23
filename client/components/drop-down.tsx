"use client";

import { useState, useEffect, useRef } from "react";

export default function Dropdown({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleClickOutside = (e: any) => {
    // TODO: Make type more precise
    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={dropdownRef} className="z-50 relative inline-block text-left">
      <button
        onClick={toggleDropdown}
        className={`inline-flex items-center justify-center w-full gap-x-1 border-2 border-secondary rounded-sm shadow-sm px-2 py-1 text-sm font-medium`}
      >
        Theme
      </button>
      {isOpen && (
        <div
          className={`origin-top-right absolute right-0 mt-1 rounded-md shadow-lg bg-primary border-secondary border-2 p-3`}
        >
          {children}
        </div>
      )}
    </div>
  );
}
