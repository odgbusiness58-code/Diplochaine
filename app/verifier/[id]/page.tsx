"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  GraduationCap,
  Hash,
  Loader2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  User,
  XCircle,
} from "lucide-react";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { diplomasApi } from "@/lib/api/diplomas";
import type { ScanVerifyResult } from "@/lib/api/types";

function CheckRow({ label, value }: { label: string; value?: boolean }) {
  if (value === undefined) return null;
  return (
    <div className="flex items-center gap-3 py-3 border-b border-slate-100 last:border-0">
      {value
        ? <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
        : <XCircle className="h-5 w-5 text-red-500 shrink-0" />}
      <span className={`text-sm font-medium ${value ? "text-slate-800" : "text-red-700"}`}>{label}</span>
      <span className={`ml-auto text-xs font-semibold px-2 py-0.5 rounded-full ${value ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
        {value ? "OK" : "ÉCHEC"}
      </span>
    </div>
  );
}

export default function VerifierDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [result, setResult] = useState<ScanVerifyResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!id) return;
    const start = Date.now();
    diplomasApi.verifyByScan(id)
      .then((res) => { setElapsed(Date.now() - start); setResult(res); })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const d = result?.diploma;
  const u = result?.university;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-white pt-20">
        <div className="mx-auto max-w-3xl px-4 py-10">

          <Link href="/verifier" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 transition-colors mb-6">
            <ArrowLeft className="h-4 w-4" />
            Retour au portail de vérification
          </Link>

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
              <p className="text-slate-600 font-medium">Vérification en cours…</p>
              <p className="text-sm text-slate-400">Interrogation de la blockchain et des signatures</p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
              <ShieldAlert className="h-16 w-16 text-red-400" />
              <p className="text-xl font-bold text-slate-900">Diplôme introuvable</p>
              <p className="text-slate-500 text-sm max-w-sm">{error}</p>
              <Link href="/verifier" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
                <ArrowLeft className="h-4 w-4" />
                Réessayer
              </Link>
            </div>
          )}

          {/* Result */}
          {!loading && result && (
            <div className="space-y-6">

              {/* Status hero */}
              <div className={`rounded-3xl p-8 text-center ${result.valid ? "bg-gradient-to-br from-emerald-500 to-emerald-700" : "bg-gradient-to-br from-red-500 to-red-700"}`}>
                <div className="mx-auto mb-4 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20">
                  {result.valid
                    ? <ShieldCheck className="h-10 w-10 text-white" />
                    : <ShieldAlert className="h-10 w-10 text-white" />}
                </div>
                <h1 className="text-2xl font-extrabold text-white">
                  {result.valid ? "Diplôme authentique" : "Diplôme invalide"}
                </h1>
                <p className="mt-2 text-white/80 text-sm">
                  {result.message ?? result.reason ?? ""}
                </p>
                {result.revocation_reason && (
                  <p className="mt-1 text-white/70 text-xs">Motif : {result.revocation_reason}</p>
                )}
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-white/90 text-sm font-medium">
                    <Shield className="h-4 w-4" />
                    Vérifié par DiploChain
                  </div>
                  {elapsed > 0 && (
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-4 py-1.5 text-white/80 text-sm font-medium">
                      <Clock className="h-4 w-4" />
                      {elapsed} ms
                    </div>
                  )}
                </div>
              </div>

              {/* Diploma info */}
              {d && (
                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                  <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <GraduationCap className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">Informations du diplôme</p>
                      <p className="text-xs text-slate-500">Données certifiées par cryptographie</p>
                    </div>
                  </div>
                  <div className="p-5 grid sm:grid-cols-2 gap-5">
                    <div className="flex gap-3">
                      <User className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-slate-400 mb-0.5">Lauréat</p>
                        <p className="font-semibold text-slate-900">{d.student}</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <GraduationCap className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-slate-400 mb-0.5">Diplôme</p>
                        <p className="font-semibold text-slate-900">{d.degree}</p>
                        {d.field && <p className="text-xs text-slate-500">{d.field}</p>}
                        {d.mention && <p className="text-xs font-medium text-blue-600">{d.mention}</p>}
                      </div>
                    </div>
                    {(d.year ?? d.issued_at) && (
                      <div className="flex gap-3">
                        <Calendar className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs text-slate-400 mb-0.5">Année d&apos;obtention</p>
                          <p className="font-semibold text-slate-900">{d.year ?? new Date(d.issued_at!).getFullYear()}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* University */}
              {u && (
                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                  <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                      <Shield className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">Établissement émetteur</p>
                      <p className="text-xs text-slate-500">Institution accréditée DiploChain</p>
                    </div>
                  </div>
                  <div className="p-5 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">{u.name}{u.acronym ? ` (${u.acronym})` : ""}</p>
                    </div>
                    {u.is_verified && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Établissement vérifié
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Blockchain */}
              {result.blockchain && (
                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                  <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">Ancrage blockchain</p>
                      <p className="text-xs text-slate-500">Polygon Amoy Testnet</p>
                    </div>
                  </div>
                  <div className="px-5 py-4">
                    <CheckRow label="Ancré sur la blockchain Polygon" value={result.blockchain.anchored} />
                    {result.blockchain.tx_hash && (
                      <div className="pt-3">
                        <p className="text-xs text-slate-400 mb-1">Transaction hash</p>
                        <p className="font-mono text-xs text-slate-700 break-all">{result.blockchain.tx_hash}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ID */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-3 flex items-center gap-2">
                <Hash className="h-4 w-4 text-slate-400 shrink-0" />
                <p className="text-xs text-slate-500 break-all">
                  Identifiant : <span className="font-mono">{id}</span>
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
