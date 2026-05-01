import { FileText, AlertTriangle, Download } from "lucide-react";

import { ButtonLink } from "@/components/ui/Button";
import { SectionHeader } from "./SectionHeader";

export function DocsSection() {
  return (
    <section id="blockchain" className="bg-slate-50 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeader
          title="Documents techniques et études"
          description="Approfondissez la conception et le contexte de DiploChain."
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="mt-5 text-xl font-semibold text-slate-900">
              Document technique
            </h3>
            <p className="mt-2 text-slate-600">Le document détaille :</p>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              <li>• La structure de la blockchain et son immuabilité</li>
              <li>• La PKI et la gestion des clés publiques/privées</li>
              <li>• L&apos;algorithme de signature ECDSA</li>
              <li>• Le hachage et l&apos;ancrage des diplômes</li>
            </ul>
            <ButtonLink
              href="/docs/DiploChain_Document_Technique.pdf"
              target="_blank"
              rel="noopener noreferrer"
              download
              className="mt-6"
            >
              <Download className="h-4 w-4" />
              Télécharger le document
            </ButtonLink>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h3 className="mt-5 text-xl font-semibold text-slate-900">
              Scandales de faux diplômes
            </h3>
            <p className="mt-2 text-slate-600">Ce dossier présente :</p>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              <li>• Les principaux scandales recensés</li>
              <li>• L&apos;impact sur les institutions et employeurs</li>
              <li>• Les conséquences économiques et sociales</li>
              <li>• L&apos;importance d&apos;une solution comme DiploChain</li>
            </ul>
            <ButtonLink
              href="/docs/scandales-faux-diplomes.pdf"
              target="_blank"
              rel="noopener noreferrer"
              download
              variant="secondary"
              className="mt-6"
            >
              <Download className="h-4 w-4" />
              Télécharger le dossier
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
