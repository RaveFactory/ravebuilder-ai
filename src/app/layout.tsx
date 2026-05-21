import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RaveBuilder AI",
  description: "Futuristic AI-powered website generator",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-cyber-darker text-gray-200 antialiased">
        {children}
      </body>
    </html>
  );
}
