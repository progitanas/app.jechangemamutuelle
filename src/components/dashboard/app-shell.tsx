"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { UserRole } from "@/generated/prisma/client";
import { Crosshair, LogOut } from "lucide-react";

type NavItem = { href: string; label: string; icon: React.ReactNode };

function NavGlyph({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const userNav: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: (
      <NavGlyph>
        <path d="M3 12.5 12 4l9 8.5" />
        <path d="M5 10.5V20h14v-9.5" />
      </NavGlyph>
    ),
  },
  {
    href: "/dashboard/demandes",
    label: "Campagnes",
    icon: (
      <NavGlyph>
        <path d="M7 4h10" />
        <rect x="4" y="3" width="16" height="18" rx="2" />
        <path d="M8 9h8M8 13h8M8 17h5" />
      </NavGlyph>
    ),
  },
  {
    href: "/dashboard/commandes",
    label: "Commandes",
    icon: (
      <NavGlyph>
        <circle cx="8" cy="19" r="1.5" />
        <circle cx="17" cy="19" r="1.5" />
        <path d="M3 5h2l2.2 9h10.8l2-7H6.2" />
      </NavGlyph>
    ),
  },
  {
    href: "/dashboard/leads",
    label: "Leads",
    icon: <Crosshair className="h-4 w-4" aria-hidden="true" />,
  },
  {
    href: "/dashboard/profile",
    label: "Profil",
    icon: (
      <NavGlyph>
        <circle cx="12" cy="8" r="3.2" />
        <path d="M5 20a7 7 0 0 1 14 0" />
      </NavGlyph>
    ),
  },
  {
    href: "/dashboard/settings",
    label: "Paramètres",
    icon: (
      <NavGlyph>
        <circle cx="12" cy="12" r="3.2" />
        <path d="M12 3v2.2M12 18.8V21M3 12h2.2M18.8 12H21M5.7 5.7l1.6 1.6M16.7 16.7l1.6 1.6M18.3 5.7l-1.6 1.6M7.3 16.7l-1.6 1.6" />
      </NavGlyph>
    ),
  },
];

const adminNav: NavItem[] = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: (
      <NavGlyph>
        <path d="M4 4h7v7H4zM13 4h7v4h-7zM13 10h7v10h-7zM4 13h7v7H4z" />
      </NavGlyph>
    ),
  },
  {
    href: "/admin/users",
    label: "Utilisateurs",
    icon: (
      <NavGlyph>
        <circle cx="9" cy="8" r="2.5" />
        <circle cx="16" cy="9" r="2" />
        <path d="M4 20a5 5 0 0 1 10 0M13 20a4 4 0 0 1 7 0" />
      </NavGlyph>
    ),
  },
  {
    href: "/admin/demandes",
    label: "Campagnes",
    icon: (
      <NavGlyph>
        <rect x="4" y="3" width="16" height="18" rx="2" />
        <path d="M8 8h8M8 12h8M8 16h5" />
      </NavGlyph>
    ),
  },
  {
    href: "/admin/orders",
    label: "Commandes",
    icon: (
      <NavGlyph>
        <circle cx="8" cy="19" r="1.5" />
        <circle cx="17" cy="19" r="1.5" />
        <path d="M3 5h2l2.2 9h10.8l2-7H6.2" />
      </NavGlyph>
    ),
  },
  {
    href: "/admin/leads",
    label: "Leads",
    icon: <Crosshair className="h-4 w-4" aria-hidden="true" />,
  },
  {
    href: "/admin/partners",
    label: "Partners",
    icon: (
      <NavGlyph>
        <path d="M4 7h16v12H4z" />
        <path d="M9 7V5h6v2" />
        <path d="M4 12h16" />
      </NavGlyph>
    ),
  },
  {
    href: "/admin/settings",
    label: "Paramètres",
    icon: (
      <NavGlyph>
        <circle cx="12" cy="12" r="3.2" />
        <path d="M12 3v2.2M12 18.8V21M3 12h2.2M18.8 12H21M5.7 5.7l1.6 1.6M16.7 16.7l1.6 1.6M18.3 5.7l-1.6 1.6M7.3 16.7l-1.6 1.6" />
      </NavGlyph>
    ),
  },
];

export function AppShell({
  children,
  role,
  userName,
}: {
  children: React.ReactNode;
  role: UserRole;
  userName: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const nav = role === "ADMIN" ? adminNav : userNav;
  const prefix = role === "ADMIN" ? "Admin" : "Espace client";

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const q = query.trim();
    if (!q) return;

    const target =
      role === "ADMIN"
        ? `/admin/demandes?q=${encodeURIComponent(q)}`
        : `/dashboard/demandes?q=${encodeURIComponent(q)}`;

    router.push(target);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed left-0 top-0 flex h-screen w-64 flex-col gap-8 border-r border-slate-200 bg-white p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
            JechangeMaMutuelle
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            {prefix}
          </h1>
        </div>
        <nav className="flex flex-1 flex-col gap-2">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                pathname === item.href || pathname.startsWith(`${item.href}/`)
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
        <form action="/api/auth/logout" method="POST">
          <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100">
            <LogOut className="h-4 w-4" />
            Se déconnecter
          </button>
        </form>
      </aside>
      <div className="ml-64">
        <header className="sticky top-0 z-40 flex h-20 items-center justify-between border-b border-slate-200 bg-white/90 px-8 backdrop-blur">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Bienvenue, {userName}
            </h2>
          </div>
          <form
            onSubmit={handleSearchSubmit}
            className="flex w-80 items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5"
          >
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-full bg-transparent px-2 py-1 text-sm text-slate-700 outline-none"
              placeholder="Rechercher un besoin, un email..."
              aria-label="Recherche"
            />
            <button
              type="submit"
              className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700"
            >
              Go
            </button>
          </form>
        </header>
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
