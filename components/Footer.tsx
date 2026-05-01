import Link from "next/link";

const productLinks = [
  { href: "/#solution", label: "Solution" },
  { href: "/#galerie", label: "Galerie" },
  { href: "/#demo", label: "Démo" },
];

const companyLinks = [
  { href: "/#probleme", label: "À Propos" },
  { href: "/#contact", label: "Contact" },
];

const portalLinks = [
  { href: "/auth/login", label: "Établissements" },
  { href: "/verifier", label: "Vérification publique" },
  { href: "/recruteur", label: "App recruteur" },
];

export function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-6xl px-5 py-12">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="text-2xl font-bold text-white">DiploChain</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              Révolutionnant la vérification des diplômes burkinabè depuis 2026.
              Cryptographie RSA + blockchain Polygon.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white">Produit</h4>
            <ul className="mt-4 space-y-2 text-sm">
              {productLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-blue-400">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white">Portails</h4>
            <ul className="mt-4 space-y-2 text-sm">
              {portalLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-blue-400">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white">Entreprise</h4>
            <ul className="mt-4 space-y-2 text-sm">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-blue-400">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-800 pt-6 text-center text-xs text-slate-500">
          <p>
            © 2026 DiploChain · Equipe-BF-10 · Hackathon MIABE 2026 — Burkina Faso
          </p>
        </div>
      </div>
    </footer>
  );
}
