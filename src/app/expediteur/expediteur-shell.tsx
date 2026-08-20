"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/actions/auth";

const NAV = [
  { href: "/expediteur", label: "Expéditions", icon: "◍" },
  { href: "/expediteur/chauffeurs", label: "Chauffeurs", icon: "◈" },
];

export default function ExpediteurShell({ nom, children }: { nom: string; children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-paper-sunk">
      <aside className="flex w-[224px] shrink-0 flex-col gap-7 bg-navy-deep px-[18px] py-[26px] text-[#C9D4E5]">
        <div className="flex flex-col gap-1">
          <div className="text-lg font-bold text-white">ColisPreuve</div>
          <div className="text-[11.5px] leading-relaxed text-[#8FA3C2]">{nom}</div>
        </div>

        <nav className="flex flex-col gap-1">
          {NAV.map((n) => {
            const active = n.href === "/expediteur" ? pathname === n.href : pathname.startsWith(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`flex items-center gap-2.5 rounded-[9px] px-3 py-2.5 text-[13.5px] ${
                  active ? "bg-white/[0.14] text-white" : "text-[#B9C6DA] hover:bg-white/[0.08]"
                }`}
              >
                <span className="text-[13px] opacity-85">{n.icon}</span>
                <span>{n.label}</span>
              </Link>
            );
          })}
          <Link
            href="/expediteur/nouvelle"
            className="mt-2 flex items-center justify-center gap-2 rounded-[9px] bg-amber px-3 py-2.5 text-[13.5px] font-semibold text-navy-deep hover:brightness-95"
          >
            + Nouvelle expédition
          </Link>
        </nav>

        <form action={logout} className="mt-auto">
          <button className="w-full rounded-[9px] border border-white/[0.35] py-2.5 text-xs font-semibold hover:bg-white/[0.08]">
            Déconnexion
          </button>
        </form>
      </aside>

      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
