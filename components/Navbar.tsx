"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { useAuth } from "@/lib/auth/context";
import { cn } from "@/lib/utils";

const sectionLinks = [
  { href: "/#accueil", label: "Accueil" },
  { href: "/#probleme", label: "Problème" },
  { href: "/#solution", label: "Solution" },
  { href: "/#galerie", label: "Galerie" },
  { href: "/#demo", label: "Démo" },
  { href: "/#contact", label: "Contact" },
];


export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, university, logout } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed inset-x-0 top-0 z-50 backdrop-blur transition-all",
        scrolled
          ? "bg-white/95 shadow-[0_2px_20px_rgba(0,0,0,0.08)]"
          : "bg-white/80"
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold text-blue-600">DiploChain</span>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {sectionLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:text-blue-600"
            >
              {link.label}
            </Link>
          ))}
          <div className="mx-2 h-5 w-px bg-slate-200" />
          {isAuthenticated ? (
            <>
              <Link
                href="/etablissement"
                className="px-3 py-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                {university?.acronym ?? university?.name?.slice(0, 16) ?? "Espace"}
              </Link>
              <button
                onClick={logout}
                className="ml-1 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link
                href="/verifier"
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Vérifier
              </Link>
              <Link
                href="/auth/login"
                className="ml-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700"
              >
                Espace établissement
              </Link>
            </>
          )}
        </div>

        <button
          aria-label="Menu"
          aria-expanded={open}
          onClick={() => setOpen((s) => !s)}
          className="flex h-10 w-10 flex-col items-center justify-center gap-1 rounded-lg lg:hidden"
        >
          <span
            className={cn(
              "block h-0.5 w-6 bg-slate-900 transition-all",
              open && "translate-y-1.5 rotate-45"
            )}
          />
          <span
            className={cn(
              "block h-0.5 w-6 bg-slate-900 transition-all",
              open && "opacity-0"
            )}
          />
          <span
            className={cn(
              "block h-0.5 w-6 bg-slate-900 transition-all",
              open && "-translate-y-1.5 -rotate-45"
            )}
          />
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-200 bg-white/95 backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-1 px-5 py-4">
            {sectionLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                {link.label}
              </Link>
            ))}
            <div className="my-2 h-px bg-slate-200" />
            {isAuthenticated ? (
              <>
                <Link
                  href="/etablissement"
                  onClick={() => setOpen(false)}
                  className="rounded-lg bg-blue-600 px-4 py-2.5 text-center text-sm font-semibold text-white"
                >
                  Mon espace ({university?.acronym ?? university?.name})
                </Link>
                <button
                  onClick={() => {
                    setOpen(false);
                    logout();
                  }}
                  className="rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-600 hover:bg-slate-100"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/verifier"
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2.5 text-center text-sm font-medium text-slate-700"
                >
                  Vérifier un diplôme
                </Link>
                <Link
                  href="/auth/login"
                  onClick={() => setOpen(false)}
                  className="rounded-lg bg-blue-600 px-4 py-2.5 text-center text-sm font-semibold text-white"
                >
                  Espace établissement
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
