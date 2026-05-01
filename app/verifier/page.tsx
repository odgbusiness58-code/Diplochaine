"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Clock,
  FileText,
  Hash,
  Loader2,
  QrCode,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Upload,
} from "lucide-react";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { diplomasApi } from "@/lib/api/diplomas";
import type { VerifyResult } from "@/lib/api/types";

// ─── Result banner ─────────────────────────────────────────────────────────────
function ResultBanner({ result, elapsed }: { result: VerifyResult; elapsed: number }) {
  const d = result.diploma;
  const u = result.university;

  return (
    <div
      className={`mt-8 rounded-2xl border p-6 ${
        result.valid
          ? "border-emerald-200 bg-emerald-50"
          : "border-red-200 bg-red-50"
      }`}
    >
      {/* Status header */}
      <div className="flex items-center gap-3 mb-5">
        {result.valid ? (
          <ShieldCheck className="h-10 w-10 text-emerald-600 shrink-0" />
        ) : (
          <ShieldAlert className="h-10 w-10 text-red-600 shrink-0" />
        )}
        <div>
          <p className={`text-xl font-bold ${result.valid ? "text-emerald-800" : "text-red-800"}`}>
            {result.valid ? "✅ Diplôme authentique" : "❌ Diplôme invalide"}
          </p>
          {result.reason && (
            <p className={`text-sm ${result.valid ? "text-emerald-700" : "text-red-700"}`}>
              {result.reason}
            </p>
          )}
          {elapsed > 0 && (
            <p className="mt-1 inline-flex items-center gap-1 text-xs text-slate-500">
              <Clock className="h-3 w-3" />
              Vérifié en {elapsed} ms
            </p>
          )}
        </div>
      </div>

      {/* Diploma details */}
      {d && (
        <div className="rounded-xl border border-white/60 bg-white/70 p-5 mb-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Informations diplôme</p>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-slate-400">Lauréat</p>
              <p className="font-semibold text-slate-900">{d.student_full_name}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Diplôme</p>
              <p className="font-semibold text-slate-900">{d.diploma_title}</p>
            </div>
            {d.field_of_study && (
              <div>
                <p className="text-xs text-slate-400">Filière</p>
                <p className="font-medium text-slate-800">{d.field_of_study}</p>
              </div>
            )}
            {d.mention && (
              <div>
                <p className="text-xs text-slate-400">Mention</p>
                <p className="font-medium text-slate-800">{d.mention}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-slate-400">Date d&apos;obtention</p>
              <p className="font-medium text-slate-800">
                {new Date(d.graduation_date).toLocaleDateString("fr-FR", {
                  day: "2-digit", month: "long", year: "numeric",
                })}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Statut</p>
              <p className={`font-semibold ${d.status === "revoked" ? "text-red-700" : "text-emerald-700"}`}>
                {d.status === "signed" ? "Signé & valide" : d.status === "revoked" ? "Révoqué" : "Brouillon"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* University */}
      {u && (
        <div className="rounded-xl border border-white/60 bg-white/70 p-5 mb-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Établissement émetteur</p>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-slate-400">Nom</p>
              <p className="font-semibold text-slate-900">{u.name}</p>
            </div>
            {u.country && (
              <div>
                <p className="text-xs text-slate-400">Pays</p>
                <p className="font-medium text-slate-800">{u.country}</p>
              </div>
            )}
            {u.blockchain_address && (
              <div className="sm:col-span-2">
                <p className="text-xs text-slate-400">Adresse Ethereum</p>
                <p className="font-mono text-xs text-slate-700 break-all">{u.blockchain_address}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Checks */}
      {result.checks && (
        <div className="rounded-xl border border-white/60 bg-white/70 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Contrôles cryptographiques</p>
          <div className="grid sm:grid-cols-2 gap-2">
            {[
              { key: "hash_match", label: "Hash correspondant" },
              { key: "rsa_signature_valid", label: "Signature RSA valide" },
              { key: "eth_signature_valid", label: "Signature Ethereum valide" },
              { key: "fingerprint_consistent", label: "Empreinte cohérente" },
              { key: "not_revoked", label: "Non révoqué" },
            ].map(({ key, label }) => {
              const v = result.checks![key as keyof typeof result.checks];
              if (v === undefined) return null;
              return (
                <div key={key} className="flex items-center gap-2 text-sm">
                  {v ? (
                    <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                  ) : (
                    <ShieldAlert className="h-4 w-4 text-red-500 shrink-0" />
                  )}
                  <span className={v ? "text-emerald-800" : "text-red-700"}>{label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Link to detail */}
      {d && (
        <div className="mt-4 text-right">
          <Link
            href={`/verifier/${d.id}`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            Voir la page de vérification complète
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
type Mode = "hash" | "file";

export default function VerifierPage() {
  const [mode, setMode] = useState<Mode>("hash");
  const [hash, setHash] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const verify = useCallback(async () => {
    setError(null);
    setResult(null);
    setElapsed(0);
    setLoading(true);
    const start = Date.now();

    try {
      let res: VerifyResult;
      if (mode === "hash") {
        if (!hash.trim()) throw new Error("Veuillez entrer un identifiant.");
        res = await diplomasApi.verifyByHash(hash.trim());
      } else {
        if (!file) throw new Error("Veuillez sélectionner un fichier PDF.");
        res = await diplomasApi.verifyByFile(file);
      }
      setElapsed(Date.now() - start);
      setResult(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur de vérification.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [mode, hash, file]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 pt-20">
        {/* Hero */}
        <section className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
          <div className="mx-auto max-w-3xl px-4 py-16 text-center">
            <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200">
              <Shield className="h-8 w-8" />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
              Portail de vérification
            </h1>
            <p className="mt-3 text-lg text-slate-600 max-w-xl mx-auto">
              Vérifiez l&apos;authenticité d&apos;un diplôme DiploChain en moins de 3 secondes, via son identifiant unique ou son fichier PDF.
            </p>
          </div>
        </section>

        {/* Verify form */}
        <section className="mx-auto max-w-2xl px-4 py-12">
          {/* Mode switcher */}
          <div className="flex rounded-2xl border border-slate-200 bg-white p-1.5 mb-6 shadow-sm">
            {([
              { id: "hash" as Mode, label: "Par identifiant / hash", icon: Hash },
              { id: "file" as Mode, label: "Par fichier PDF", icon: FileText },
            ] as const).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => { setMode(id); setResult(null); setError(null); }}
                className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 px-4 text-sm font-semibold transition-all ${
                  mode === id
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Input zone */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            {mode === "hash" ? (
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-slate-700">
                  Identifiant unique (UUID ou hash)
                </label>
                <div className="flex gap-3">
                  <input
                    id="verify-hash-input"
                    type="text"
                    value={hash}
                    onChange={(e) => setHash(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && verify()}
                    placeholder="Ex : 0x3a5f… ou 550e8400-e29b-41d4-…"
                    className="flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                  <Button onClick={verify} disabled={loading} size="lg" className="shrink-0">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    {loading ? "…" : "Vérifier"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-slate-700">
                  Fichier PDF du diplôme
                </label>
                <div
                  onClick={() => fileRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-10 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
                >
                  <Upload className="h-10 w-10 text-slate-400" />
                  {file ? (
                    <div className="text-center">
                      <p className="font-semibold text-slate-800">{file.name}</p>
                      <p className="text-sm text-slate-500">{(file.size / 1024).toFixed(1)} Ko</p>
                    </div>
                  ) : (
                    <>
                      <p className="font-semibold text-slate-700">Glissez le PDF ici ou cliquez</p>
                      <p className="text-sm text-slate-500">Fichier PDF uniquement</p>
                    </>
                  )}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
                <Button onClick={verify} disabled={loading || !file} fullWidth size="lg">
                  {loading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Vérification en cours…</>
                  ) : (
                    <><ShieldCheck className="h-4 w-4" /> Vérifier ce diplôme</>
                  )}
                </Button>
              </div>
            )}

            {error && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                <ShieldAlert className="h-5 w-5 text-red-600 shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
          </div>

          {/* Result */}
          {result && <ResultBanner result={result} elapsed={elapsed} />}

          {/* How it works */}
          <div className="mt-10 grid sm:grid-cols-3 gap-4">
            {[
              { icon: Hash, title: "Identifiant unique", desc: "Chaque diplôme possède un identifiant unique inscrit sur la blockchain." },
              { icon: ShieldCheck, title: "Vérification multi-couches", desc: "Hash SHA-256, signature RSA, signature Ethereum — 3 niveaux de sécurité." },
              { icon: QrCode, title: "Résultat immédiat", desc: "La vérification prend moins de 3 secondes grâce à l'API DiploChain." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm text-center">
                <div className="mx-auto mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="font-semibold text-slate-800 text-sm">{title}</p>
                <p className="text-xs text-slate-500 mt-1">{desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
