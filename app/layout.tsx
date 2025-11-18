import "./globals.css";
import type { Metadata } from "next";
import { Header } from "@/components/header";

export const metadata: Metadata = {
  title: "TinyLink",
  description: "Create, manage, and track short links with TinyLink."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
          <footer className="bg-white border-t border-slate-200">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 text-sm text-slate-500">
              <span>© {new Date().getFullYear()} TinyLink</span>
              <span>Built with Next.js and Tailwind</span>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}

