import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "My Navy Budget",
  description: "Track Navy pay, budgets, and projections",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="w-full border-b bg-white/70 backdrop-blur">
          <nav className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-4">
            <Link href="/" className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200">Home</Link>
            <Link href="/pay" className="px-3 py-1 rounded hover:bg-gray-100">Pay</Link>
            <Link href="/budget" className="px-3 py-1 rounded hover:bg-gray-100">Budget</Link>
          </nav>
        </header>
        <main className="pt-4">{children}</main>
      </body>
    </html>
  );
}
