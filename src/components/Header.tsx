"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Dashboard", icon: "⚡" },
  { href: "/generations", label: "My Generations", icon: "📁" },
  { href: "/settings", label: "Settings", icon: "⚙" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-cyber-border bg-cyber-darker/80 backdrop-blur-xl">
      <div className="mx-auto max-w-5xl px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold neon-text-purple tracking-wider">
              RaveBuilder
            </span>
            <span className="text-sm font-light text-neon-blue">AI</span>
          </Link>

          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-300
                    ${
                      isActive
                        ? "bg-neon-purple/15 text-neon-purple shadow-neon-purple/20 shadow-sm"
                        : "text-gray-400 hover:bg-cyber-surface hover:text-gray-200"
                    }
                  `}
                >
                  <span className="text-base">{item.icon}</span>
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
