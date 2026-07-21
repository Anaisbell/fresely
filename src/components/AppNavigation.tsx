"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const DESTINATIONS = [
  { href: "/home", label: "Home" },
  { href: "/kitchen", label: "Kitchen" },
  { href: "/settings", label: "Settings" },
] as const;

export function AppNavigation() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary navigation"
      data-app-nav="primary"
      className="border-t border-line bg-cream"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <ul className="flex items-stretch">
        {DESTINATIONS.map(({ href, label }) => {
          const active = pathname === href;

          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={
                  active
                    ? "block text-center py-3 text-sm tracking-wide font-medium text-charcoal transition-colors duration-150"
                    : "block text-center py-3 text-sm tracking-wide font-normal text-quiet hover:text-muted transition-colors duration-150"
                }
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
