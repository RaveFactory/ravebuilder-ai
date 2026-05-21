import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "RaveBuilder AI",
  description: "Futuristic AI-powered website generator with cyberpunk aesthetics",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-cyber-darker text-gray-200 antialiased">
        <div className="scanline fixed inset-0 z-50 opacity-30" />
        <Header />
        <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
