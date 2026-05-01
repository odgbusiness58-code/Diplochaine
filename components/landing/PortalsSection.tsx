import Link from "next/link";
import { GraduationCap, Search, Smartphone, ArrowRight } from "lucide-react";

import { SectionHeader } from "./SectionHeader";

const portals = [
  {
    href: "/auth/login",
    icon: GraduationCap,
    title: "Établissements",
    desc: "Émettez et signez vos diplômes avec une cryptographie de bout en bout.",
    cta: "Accéder à l'espace",
    accent: "from-blue-500 to-indigo-600",
  },
  {
    href: "/verifier",
    icon: Search,
    title: "Vérification publique",
    desc: "Vérifiez l'authenticité d'un diplôme par identifiant ou fichier PDF.",
    cta: "Vérifier maintenant",
    accent: "from-emerald-500 to-teal-600",
  },
  {
    href: "/recruteur",
    icon: Smartphone,
    title: "App recruteurs",
    desc: "Application mobile pour scanner un QR code en entretien.",
    cta: "Ouvrir l'app",
    accent: "from-amber-500 to-orange-600",
  },
];

export function PortalsSection() {
  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeader
          title="Trois portails, un seul système"
          description="Que vous soyez université, employeur ou citoyen, DiploChain offre une porte d'entrée adaptée."
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {portals.map(({ href, icon: Icon, title, desc, cta, accent }) => (
            <Link
              key={href}
              href={href}
              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div
                className={`absolute -right-6 -top-6 h-28 w-28 rounded-full bg-gradient-to-br ${accent} opacity-15 blur-2xl transition-opacity group-hover:opacity-30`}
              />
              <div
                className={`relative inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${accent} text-white shadow-md`}
              >
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="relative mt-5 text-xl font-semibold text-slate-900">
                {title}
              </h3>
              <p className="relative mt-2 text-sm text-slate-600">{desc}</p>
              <span className="relative mt-6 inline-flex items-center gap-1 text-sm font-semibold text-blue-600 group-hover:text-blue-700">
                {cta}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
