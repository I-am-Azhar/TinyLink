"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

const tabs = [
  { href: "/", label: "Dashboard" }
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="bg-white border-b border-slate-200">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-xl font-semibold text-slate-900">
          TinyLink
        </Link>
        <nav className="flex gap-3">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            if (isActive) {
              return null;
            }

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="rounded-full px-4 py-1 text-sm font-medium text-slate-600 transition hover:text-slate-900"
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

