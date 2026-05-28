import "./globals.css";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "RaveBuilder AI",
  description:
    "Generate rave and cyberpunk websites with AI.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className="
          scanlines
          cyber-grid
          min-h-screen
          antialiased
        "
      >
        {children}
      </body>
    </html>
  );
}
