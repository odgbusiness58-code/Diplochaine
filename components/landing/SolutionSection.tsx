import Image from "next/image";
import { Shield, QrCode, Clock, Users } from "lucide-react";

import { SectionHeader } from "./SectionHeader";

const features = [
  {
    icon: Shield,
    title: "Sécurité Blockchain",
    description: "Chaque diplôme est ancré de manière immuable sur Polygon Amoy.",
  },
  {
    icon: QrCode,
    title: "QR Code Unique",
    description: "Vérification instantanée via scan de QR code par smartphone.",
  },
  {
    icon: Clock,
    title: "Vérification Rapide",
    description: "Résultats en moins de 3 secondes, où que vous soyez.",
  },
  {
    icon: Users,
    title: "Accès Universel",
    description: "Disponible pour tous les établissements et recruteurs.",
  },
];

export function SolutionSection() {
  return (
    <section id="solution" className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeader
          title="Notre solution innovante"
          description="DiploChain apporte une réponse technologique aux défis de la vérification des qualifications."
        />

        <div className="mt-16 grid items-center gap-12 lg:grid-cols-2">
          <div className="overflow-hidden rounded-2xl shadow-xl ring-1 ring-slate-200">
            <Image
              src="/img/img3.jpg"
              alt="Solution DiploChain"
              width={800}
              height={600}
              className="h-auto w-full object-cover"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {features.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Icon className="h-6 w-6" />
                </div>
                <h4 className="mt-4 text-lg font-semibold text-slate-900">{title}</h4>
                <p className="mt-2 text-sm text-slate-600">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
