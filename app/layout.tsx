import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RaveBuilder AI — Cyberpunk Website Builder",
  description:
    "Generate stunning cyberpunk, hardtek, jungle, and minimal websites with AI. Just describe your vision and watch it come alive.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="scanlines cyber-grid min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
