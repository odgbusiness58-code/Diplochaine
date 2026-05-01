import Image from "next/image";
import { XCircle } from "lucide-react";

import { SectionHeader } from "./SectionHeader";

const problems = [
  "Diplômes falsifiés difficiles à détecter",
  "Processus de vérification manuel et lent",
  "Risques pour les entreprises et établissements",
  "Perte de confiance dans les qualifications",
];

export function ProblemSection() {
  return (
    <section id="probleme" className="bg-slate-50 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeader
          title="Le problème des diplômes falsifiés"
          description="Chaque année, des milliers de diplômes frauduleux circulent dans le monde professionnel."
        />

        <div className="mt-16 grid items-center gap-12 lg:grid-cols-2">
          <div>
            <h3 className="text-2xl font-semibold text-slate-900">
              Une réalité préoccupante
            </h3>
            <ul className="mt-6 space-y-4">
              {problems.map((problem) => (
                <li key={problem} className="flex items-start gap-3">
                  <XCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
                  <span className="text-slate-700">{problem}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="overflow-hidden rounded-2xl shadow-xl ring-1 ring-slate-200">
            <Image
              src="/img/img2.jpg"
              alt="Problème des diplômes falsifiés"
              width={800}
              height={600}
              className="h-auto w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
