"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  QrCode,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Upload,
  XCircle,
} from "lucide-react";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { diplomasApi } from "@/lib/api/diplomas";
import { ApiError } from "@/lib/api/types";
import type { ScanVerifyResult, VerifyResult } from "@/lib/api/types";

function getVerifyErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 404) return "Diplôme introuvable. Cet identifiant n'existe pas dans le registre.";
    if (err.status === 400) return "Identifiant invalide ou diplôme introuvable dans le registre DiploChain.";
    if (err.status === 0) return "Erreur réseau. Vérifiez votre connexion et réessayez.";
    return err.message || "Erreur lors de la vérification.";
  }
  if (err instanceof Error) return err.message;
  return "Erreur de vérification.";
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
const REASON_FR: Record<string, string> = {
  authentic: "Diplôme authentique et valide",
  revoked: "Ce diplôme a été révoqué par l'université",
  name_mismatch: "Le nom ne correspond pas à l'identifiant",
  not_found: "Diplôme introuvable dans la base",
};

function fmt(dateStr?: string | number) {
  if (!dateStr) return null;
  const d = typeof dateStr === "number" ? new Date(`${dateStr}-01-01`) : new Date(dateStr);
  if (isNaN(d.getTime())) return String(dateStr);
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
}

// ─── Scan Result Banner ────────────────────────────────────────────────────────
function ScanResultBanner({ result, elapsed }: { result: ScanVerifyResult; elapsed: number }) {
  const valid = result.valid;
  const d = result.diploma;
  const u = result.university;
  const reason = result.reason ? (REASON_FR[result.reason] ?? result.reason) : null;

  return (
    <div className={`mt-8 rounded-2xl border p-6 ${valid ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"}`}>
      {/* Status */}
      <div className="flex items-start gap-4 mb-5">
        {valid
          ? <CheckCircle2 className="h-10 w-10 text-emerald-600 shrink-0 mt-0.5" />
          : <XCircle className="h-10 w-10 text-red-500 shrink-0 mt-0.5" />}
        <div>
          <p className={`text-xl font-bold ${valid ? "text-emerald-800" : "text-red-800"}`}>
            {valid ? "✅ Diplôme authentique" : "❌ Diplôme invalide"}
          </p>
          <p className={`text-sm mt-0.5 ${valid ? "text-emerald-700" : "text-red-700"}`}>
            {result.message ?? reason ?? ""}
          </p>
          {result.revocation_reason && (
            <p className="text-sm text-red-600 mt-1">Motif : {result.revocation_reason}</p>
          )}
          {elapsed > 0 && (
            <p className="mt-1.5 inline-flex items-center gap-1 text-xs text-slate-500">
              <Clock className="h-3 w-3" />
              Vérifié en {elapsed} ms
            </p>
          )}
        </div>
      </div>

      {/* Diploma info */}
      {d && (
        <div className="rounded-xl border border-white/60 bg-white/70 p-5 mb-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Informations diplôme</p>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-slate-400">Lauréat</p>
              <p className="font-semibold text-slate-900">{d.student}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Diplôme</p>
              <p className="font-semibold text-slate-900">{d.degree}</p>
            </div>
            {d.field && (
              <div>
                <p className="text-xs text-slate-400">Filière</p>
                <p className="font-medium text-slate-800">{d.field}</p>
              </div>
            )}
            {d.mention && (
              <div>
                <p className="text-xs text-slate-400">Mention</p>
                <p className="font-medium text-slate-800">{d.mention}</p>
              </div>
            )}
            {(d.year ?? d.issued_at) && (
              <div>
                <p className="text-xs text-slate-400">Année / émission</p>
                <p className="font-medium text-slate-800">{fmt(d.year ?? d.issued_at)}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* University */}
      {u && (
        <div className="rounded-xl border border-white/60 bg-white/70 p-5 mb-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Établissement émetteur</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-900">{u.name}{u.acronym ? ` (${u.acronym})` : ""}</p>
            </div>
            {u.is_verified && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                <ShieldCheck className="h-3.5 w-3.5" />
                Vérifié
              </span>
            )}
          </div>
        </div>
      )}

      {/* Blockchain */}
      {result.blockchain && (
        <div className="rounded-xl border border-white/60 bg-white/70 p-5 mb-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Ancrage blockchain</p>
          <div className="flex items-center gap-2 text-sm">
            {result.blockchain.anchored
              ? <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              : <XCircle className="h-4 w-4 text-red-500 shrink-0" />}
            <span className={result.blockchain.anchored ? "text-emerald-800" : "text-red-700"}>
              {result.blockchain.anchored ? "Ancré sur la blockchain Polygon" : "Non ancré"}
            </span>
          </div>
          {result.blockchain.tx_hash && (
            <p className="font-mono text-xs text-slate-500 mt-1 break-all">{result.blockchain.tx_hash}</p>
          )}
        </div>
      )}

      {d && (
        <div className="mt-2 text-right">
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

// ─── Hash/file Result Banner ───────────────────────────────────────────────────
function ResultBanner({ result, elapsed }: { result: VerifyResult; elapsed: number }) {
  const d = result.diploma;
  const u = result.university;
  return (
    <div className={`mt-8 rounded-2xl border p-6 ${result.valid ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"}`}>
      <div className="flex items-start gap-4 mb-5">
        {result.valid
          ? <CheckCircle2 className="h-10 w-10 text-emerald-600 shrink-0 mt-0.5" />
          : <XCircle className="h-10 w-10 text-red-500 shrink-0 mt-0.5" />}
        <div>
          <p className={`text-xl font-bold ${result.valid ? "text-emerald-800" : "text-red-800"}`}>
            {result.valid ? "✅ Diplôme authentique" : "❌ Diplôme invalide"}
          </p>
          {result.reason && (
            <p className={`text-sm mt-0.5 ${result.valid ? "text-emerald-700" : "text-red-700"}`}>
              {REASON_FR[result.reason] ?? result.reason}
            </p>
          )}
          {elapsed > 0 && (
            <p className="mt-1.5 inline-flex items-center gap-1 text-xs text-slate-500">
              <Clock className="h-3 w-3" />
              Vérifié en {elapsed} ms
            </p>
          )}
        </div>
      </div>

      {d && (
        <div className="rounded-xl border border-white/60 bg-white/70 p-5 mb-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Informations diplôme</p>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div><p className="text-xs text-slate-400">Lauréat</p><p className="font-semibold text-slate-900">{d.student_full_name}</p></div>
            <div><p className="text-xs text-slate-400">Diplôme</p><p className="font-semibold text-slate-900">{d.diploma_title}</p></div>
            {d.field_of_study && <div><p className="text-xs text-slate-400">Filière</p><p className="font-medium text-slate-800">{d.field_of_study}</p></div>}
            {d.mention && <div><p className="text-xs text-slate-400">Mention</p><p className="font-medium text-slate-800">{d.mention}</p></div>}
            <div>
              <p className="text-xs text-slate-400">Date d&apos;obtention</p>
              <p className="font-medium text-slate-800">{fmt(d.graduation_date)}</p>
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

      {u && (
        <div className="rounded-xl border border-white/60 bg-white/70 p-5 mb-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Établissement émetteur</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-900">{u.name}</p>
              {u.country && <p className="text-sm text-slate-600">{u.country}</p>}
            </div>
            {u.is_verified && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                <ShieldCheck className="h-3.5 w-3.5" />
                Vérifié
              </span>
            )}
          </div>
          {u.blockchain_address && (
            <p className="font-mono text-xs text-slate-500 mt-2 break-all">{u.blockchain_address}</p>
          )}
        </div>
      )}

      {result.checks && (
        <div className="rounded-xl border border-white/60 bg-white/70 p-5 mb-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Contrôles cryptographiques</p>
          <div className="grid sm:grid-cols-2 gap-2">
            {([
              { key: "hash_match", label: "Hash correspondant" },
              { key: "rsa_signature_valid", label: "Signature RSA valide" },
              { key: "eth_signature_valid", label: "Signature Ethereum valide" },
              { key: "fingerprint_consistent", label: "Empreinte cohérente" },
              { key: "not_revoked", label: "Non révoqué" },
            ] as const).map(({ key, label }) => {
              const v = result.checks![key];
              if (v === undefined) return null;
              return (
                <div key={key} className="flex items-center gap-2 text-sm">
                  {v ? <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" /> : <XCircle className="h-4 w-4 text-red-500 shrink-0" />}
                  <span className={v ? "text-emerald-800" : "text-red-700"}>{label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {d && (
        <div className="text-right">
          <Link href={`/verifier/${d.id}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
            Voir la page complète <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
type Mode = "scan" | "file";

export default function VerifierPage() {
  const [mode, setMode] = useState<Mode>("scan");
  const [query, setQuery] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState<ScanVerifyResult | null>(null);
  const [hashResult, setHashResult] = useState<VerifyResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setScanResult(null);
    setHashResult(null);
    setError(null);
    setElapsed(0);
  };

  const verify = useCallback(async () => {
    reset();
    setLoading(true);
    const start = Date.now();
    try {
      if (mode === "scan") {
        const q = query.trim();
        if (!q) throw new Error("Veuillez entrer un identifiant de diplôme.");
        if (diplomasApi.isUuid(q)) {
          const res = await diplomasApi.verifyByScan(q);
          setScanResult(res);
        } else {
          const res = await diplomasApi.verifyByHash(q);
          setHashResult(res);
        }
      } else {
        if (!file) throw new Error("Veuillez sélectionner un fichier PDF.");
        const res = await diplomasApi.verifyByFile(file);
        setHashResult(res);
      }
      setElapsed(Date.now() - start);
    } catch (err: unknown) {
      setError(getVerifyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [mode, query, file]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 pt-20">

        {/* Hero */}
        <section className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
          <div className="mx-auto max-w-3xl px-4 py-14 text-center">
            <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200">
              <Shield className="h-8 w-8" />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
              Portail de vérification
            </h1>
            <p className="mt-3 text-lg text-slate-600 max-w-xl mx-auto">
              Vérifiez l&apos;authenticité d&apos;un diplôme DiploChain en quelques secondes — par identifiant, QR code ou fichier PDF.
            </p>
          </div>
        </section>

        {/* Form */}
        <section className="mx-auto max-w-2xl px-4 py-12">

          {/* Mode tabs */}
          <div className="flex rounded-2xl border border-slate-200 bg-white p-1.5 mb-6 shadow-sm">
            {([
              { id: "scan" as Mode, label: "Par ID / QR code", icon: QrCode },
              { id: "file" as Mode, label: "Par fichier PDF", icon: FileText },
            ] as const).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => { setMode(id); reset(); }}
                className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 px-4 text-sm font-semibold transition-all ${
                  mode === id ? "bg-blue-600 text-white shadow-md" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            {mode === "scan" ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Identifiant du diplôme (UUID) ou hash SHA-256
                  </label>
                  <p className="text-xs text-slate-500 mb-3">
                    Scannez le QR code du diplôme PDF ou collez l&apos;identifiant directement.
                  </p>
                </div>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && verify()}
                    placeholder="ex : e94ac5d8-474a-487e-87e7-bf9206e41e14"
                    className="flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-mono"
                  />
                  <Button onClick={verify} disabled={loading} size="lg" className="shrink-0">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    {loading ? "…" : "Vérifier"}
                  </Button>
                </div>
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <QrCode className="h-3.5 w-3.5" />
                  Le QR code sur le diplôme PDF contient directement l&apos;identifiant.
                </p>
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
                  onChange={(e) => { setFile(e.target.files?.[0] ?? null); reset(); }}
                />
                <Button onClick={verify} disabled={loading || !file} fullWidth size="lg">
                  {loading
                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Vérification en cours…</>
                    : <><ShieldCheck className="h-4 w-4" /> Vérifier ce diplôme</>}
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
          {scanResult && <ScanResultBanner result={scanResult} elapsed={elapsed} />}
          {hashResult && <ResultBanner result={hashResult} elapsed={elapsed} />}

          {/* Info cards */}
          <div className="mt-10 grid sm:grid-cols-3 gap-4">
            {[
              {
                icon: QrCode,
                title: "Scan QR code",
                desc: "Scannez le QR code du diplôme PDF — l'ID est extrait automatiquement.",
              },
              {
                icon: ShieldCheck,
                title: "Vérification 3 niveaux",
                desc: "Hash SHA-256, signature RSA, ancrage Polygon — cryptographie bout en bout.",
              },
              {
                icon: Clock,
                title: "Résultat < 3 secondes",
                desc: "Réponse instantanée pour les recruteurs lors d'un entretien.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm text-center">
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
