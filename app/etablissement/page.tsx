"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Award,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  FilePlus2,
  GraduationCap,
  Key,
  Loader2,
  LogOut,
  QrCode as QrCodeIcon,
  RefreshCw,
  ShieldCheck,
  Trash2,
  X,
  XCircle,
} from "lucide-react";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { QrCode } from "@/components/QrCode";
import { diplomasApi } from "@/lib/api/diplomas";
import { authApi } from "@/lib/api/auth";
import { useAuth } from "@/lib/auth/context";
import { generateDiplomaPDF } from "@/lib/generateDiplomaPDF";
import type { Diploma, IssueDiplomaPayload, UniversityKeys } from "@/lib/api/types";
import { ApiError } from "@/lib/api/types";

// ─── helpers ───────────────────────────────────────────────────────────────
function statusTone(s: Diploma["status"]) {
  return s === "signed" ? "success" : s === "revoked" ? "danger" : "warning";
}
function statusLabel(s: Diploma["status"]) {
  return s === "signed" ? "Signé" : s === "revoked" ? "Révoqué" : "Brouillon";
}
function fmt(d?: string | number | null) {
  if (!d) return "—";
  if (typeof d === "number") return String(d);
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return String(d);
  return dt.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

function getGraduationDisplay(diploma: Diploma) {
  if (diploma.graduation_year) return String(diploma.graduation_year);
  if (diploma.graduation_date) return fmt(diploma.graduation_date);
  return "—";
}

function getDiplomaTitle(diploma: Diploma) {
  return diploma.degree_title ?? diploma.diploma_title ?? "—";
}

// ─── Issue form ─────────────────────────────────────────────────────────────
const emptyForm = {
  student_first_name: "",
  student_last_name: "",
  student_birth_date: "",
  student_id_number: "",
  degree_title: "",
  field_of_study: "",
  graduation_date: "",
  mention: "",
};

function IssueModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: (d: Diploma) => void }) {
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (k: keyof typeof emptyForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((s) => ({ ...s, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const payload: IssueDiplomaPayload = {
        student_first_name: form.student_first_name.trim(),
        student_last_name: form.student_last_name.trim(),
        student_birth_date: form.student_birth_date,
        degree_title: form.degree_title.trim(),
        graduation_year: new Date(form.graduation_date).getFullYear(),
        ...(form.student_id_number?.trim() ? { student_id_number: form.student_id_number.trim() } : {}),
        ...(form.field_of_study?.trim() ? { field_of_study: form.field_of_study.trim() } : {}),
        ...(form.mention?.trim() ? { mention: form.mention.trim() } : {}),
      };
      const diploma = await diplomasApi.issue(payload);
      console.log("[DiploChain] Diploma issued:", diploma);
      onSuccess(diploma);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        const data = err.data as Record<string, unknown> | null;
        if (data && typeof data === "object") {
          const firstKey = Object.keys(data)[0];
          const value = data[firstKey];
          const raw = Array.isArray(value) ? String(value[0]) : String(value ?? err.message);
          setError(`${firstKey} : ${raw}`);
        } else {
          setError(err.message || "Erreur lors de l'émission.");
        }
      } else {
        const msg = err instanceof Error ? err.message : "Erreur lors de l'émission.";
        setError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <FilePlus2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Émettre un diplôme</h2>
              <p className="text-xs text-slate-500">Renseignez les informations du lauréat</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Informations étudiant */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Informations étudiant</p>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Nom de famille"
                  required
                  value={form.student_last_name}
                  onChange={update("student_last_name")}
                  placeholder="SAWADOGO"
                />
                <Input
                  label="Prénom"
                  required
                  value={form.student_first_name}
                  onChange={update("student_first_name")}
                  placeholder="Amidou"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Date de naissance"
                  type="date"
                  required
                  value={form.student_birth_date}
                  onChange={update("student_birth_date")}
                />
                <Input
                  label="N° matricule (optionnel)"
                  value={form.student_id_number ?? ""}
                  onChange={update("student_id_number")}
                  placeholder="2021BF001"
                />
              </div>
            </div>
          </div>

          {/* Informations diplôme */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Informations diplôme</p>
            <div className="space-y-4">
              <Input
                label="Intitulé du diplôme"
                required
                value={form.degree_title}
                onChange={update("degree_title")}
                placeholder="Licence en Informatique"
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Filière / spécialité"
                  value={form.field_of_study}
                  onChange={update("field_of_study")}
                  placeholder="Génie Logiciel"
                />
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-slate-700">Mention</label>
                  <select
                    value={form.mention}
                    onChange={(e) => setForm((s) => ({ ...s, mention: e.target.value }))}
                    className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all bg-white"
                  >
                    <option value="">— Sans mention —</option>
                    <option value="passable">Passable</option>
                    <option value="assez_bien">Assez Bien</option>
                    <option value="bien">Bien</option>
                    <option value="tres_bien">Très Bien</option>
                    <option value="felicitations">Félicitations du jury</option>
                  </select>
                </div>
              </div>
              <Input
                label="Date d'obtention"
                type="date"
                required
                value={form.graduation_date}
                onChange={update("graduation_date")}
              />
            </div>
          </div>

          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" className="flex-1" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" className="flex-1" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Émission en cours…
                </>
              ) : (
                <>
                  <FilePlus2 className="h-4 w-4" />
                  Émettre le diplôme
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Diploma Row ─────────────────────────────────────────────────────────────
function DiplomaRow({ diploma, universityName, onRevoke }: { diploma: Diploma; universityName: string; onRevoke: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [revoking, setRevoking] = useState(false);
  const [reason, setReason] = useState("");
  const [showRevoke, setShowRevoke] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [copied, setCopied] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const verifyUrl = typeof window !== "undefined"
    ? `${window.location.origin}/verifier/${diploma.id}`
    : `/verifier/${diploma.id}`;

  const copyLink = () => {
    navigator.clipboard.writeText(verifyUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleRevoke = async () => {
    setRevoking(true);
    try {
      await diplomasApi.revoke(diploma.id, reason || undefined);
      onRevoke(diploma.id);
    } catch {
      // ignore
    } finally {
      setRevoking(false);
      setShowRevoke(false);
    }
  };

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white transition-shadow hover:shadow-md">
      {/* Main row */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-slate-50 transition-colors"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          <GraduationCap className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-900 truncate">{diploma.student_full_name}</p>
          <p className="text-sm text-slate-500 truncate">{getDiplomaTitle(diploma)}</p>
        </div>
        <Badge tone={statusTone(diploma.status)}>{statusLabel(diploma.status)}</Badge>
        <span className="text-slate-400 ml-2">
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </span>
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-slate-100 px-5 py-4 bg-slate-50 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
            {diploma.field_of_study && (
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Filière</p>
                <p className="font-medium text-slate-800">{diploma.field_of_study}</p>
              </div>
            )}
            {diploma.mention && (
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Mention</p>
                <p className="font-medium text-slate-800">{diploma.mention}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Date obtention</p>
              <p className="font-medium text-slate-800">{getGraduationDisplay(diploma)}</p>
            </div>
            {diploma.student_birth_date && (
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Date naissance</p>
                <p className="font-medium text-slate-800">{fmt(diploma.student_birth_date)}</p>
              </div>
            )}
            {diploma.student_id_number && (
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Matricule</p>
                <p className="font-medium text-slate-800">{diploma.student_id_number}</p>
              </div>
            )}
            {diploma.issued_at && (
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Émis le</p>
                <p className="font-medium text-slate-800">{fmt(diploma.issued_at)}</p>
              </div>
            )}
          </div>

          {diploma.hash && (
            <div className="rounded-lg bg-white border border-slate-200 px-3 py-2">
              <p className="text-xs text-slate-400 mb-1">Hash du diplôme</p>
              <p className="font-mono text-xs text-slate-600 break-all">{diploma.hash}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            {diploma.pdf_url ? (
              <a
                href={diploma.pdf_url.startsWith("http") ? diploma.pdf_url : `https://unixdev38.pythonanywhere.com${diploma.pdf_url.startsWith("/") ? "" : "/"}${diploma.pdf_url}`}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                PDF
              </a>
            ) : (
              <Button
                size="sm"
                variant="secondary"
                disabled={generatingPdf}
                onClick={async () => {
                  setPdfError(null);
                  setGeneratingPdf(true);
                  try { await generateDiplomaPDF(diploma, universityName); }
                  catch (e) { setPdfError(e instanceof Error ? e.message : "Erreur PDF"); }
                  finally { setGeneratingPdf(false); }
                }}
              >
                {generatingPdf
                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  : <Download className="h-3.5 w-3.5" />}
                PDF
              </Button>
            )}
            {pdfError && (
              <span className="text-xs text-red-600 self-center">{pdfError}</span>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => window.open(verifyUrl, "_blank")}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Vérifier
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowQr((v) => !v)}
            >
              <QrCodeIcon className="h-3.5 w-3.5" />
              QR Code
            </Button>
            <Button size="sm" variant="ghost" onClick={copyLink}>
              <Copy className="h-3.5 w-3.5" />
              {copied ? "Copié !" : "Copier lien"}
            </Button>
            {diploma.status !== "revoked" && (
              <Button
                size="sm"
                variant="danger"
                onClick={() => setShowRevoke(true)}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Révoquer
              </Button>
            )}
            {diploma.status === "revoked" && diploma.revocation_reason && (
              <p className="text-xs text-red-600 self-center">
                Motif : {diploma.revocation_reason}
              </p>
            )}
          </div>

          {/* QR Code panel */}
          {showQr && diploma.status === "signed" && (
            <div className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col sm:flex-row items-center gap-5">
              <QrCode value={verifyUrl} size={160} />
              <div className="text-sm text-slate-600 text-center sm:text-left">
                <p className="font-semibold text-slate-800 mb-1">QR Code de vérification</p>
                <p className="text-xs text-slate-500 mb-3">
                  Ce QR code pointe vers la page de vérification publique du diplôme.
                  Un recruteur peut le scanner en moins de 3 secondes.
                </p>
                <p className="font-mono text-xs text-slate-400 break-all">{diploma.id}</p>
              </div>
            </div>
          )}

          {/* Revoke confirm */}
          {showRevoke && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 space-y-3">
              <p className="text-sm font-semibold text-red-800">Confirmer la révocation</p>
              <Input
                label="Motif (optionnel)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ex : erreur administrative"
              />
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => setShowRevoke(false)} className="flex-1">
                  Annuler
                </Button>
                <Button size="sm" variant="danger" onClick={handleRevoke} disabled={revoking} className="flex-1">
                  {revoking ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                  Confirmer
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Keys Modal ───────────────────────────────────────────────────────────────
function KeysModal({ onClose }: { onClose: () => void }) {
  const [keys, setKeys] = useState<UniversityKeys | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    authApi.keys().then(setKeys).catch((e) => setErr(e.message)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Key className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Clés cryptographiques</h2>
              <p className="text-xs text-slate-500">RSA + Ethereum — gardez-les secrètes</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          {loading && <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>}
          {err && <p className="text-red-600 text-sm">{err}</p>}
          {keys && (
            <>
              {[
                { label: "Adresse Ethereum", value: keys.blockchain_address },
                { label: "Clé publique RSA", value: keys.rsa_public_key_pem },
                { label: "Empreinte (fingerprint)", value: keys.fingerprint },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{label}</p>
                  <pre className="font-mono text-xs text-slate-700 whitespace-pre-wrap break-all">{value}</pre>
                </div>
              ))}
              <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                <p className="text-xs font-semibold text-red-700 uppercase tracking-wider mb-2">⚠️ Clé privée RSA (confidentielle)</p>
                <pre className="font-mono text-xs text-red-800 whitespace-pre-wrap break-all">{keys.rsa_private_key_pem}</pre>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function EtablissementPage() {
  const router = useRouter();
  const { university, isLoading, logout, refresh } = useAuth();
  const searchParams = useSearchParams();
  const isWelcome = searchParams.get("welcome") === "1";

  useEffect(() => {
    if (!isLoading && !university) {
      router.replace("/auth/login?next=/etablissement");
    }
  }, [isLoading, university, router]);

  const [diplomas, setDiplomas] = useState<Diploma[]>([]);
  const [loading, setLoading] = useState(true);
  const [showIssue, setShowIssue] = useState(false);
  const [showKeys, setShowKeys] = useState(false);
  const [welcome, setWelcome] = useState(isWelcome);
  const [filter, setFilter] = useState<"all" | "signed" | "revoked" | "draft">("all");

  const loadDiplomas = useCallback(async () => {
    setLoading(true);
    try {
      const list = await diplomasApi.listMine();
      setDiplomas(list);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadDiplomas(); }, [loadDiplomas]);

  const handleIssueSuccess = (d: Diploma) => {
    setDiplomas((prev) => [d, ...prev]);
    setShowIssue(false);
  };

  const handleRevoke = (id: string) => {
    setDiplomas((prev) => prev.map((d) => d.id === id ? { ...d, status: "revoked" as const } : d));
  };

  const filtered = filter === "all" ? diplomas : diplomas.filter((d) => d.status === filter);

  const stats = {
    total: diplomas.length,
    signed: diplomas.filter((d) => d.status === "signed").length,
    revoked: diplomas.filter((d) => d.status === "revoked").length,
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 pt-20">
        <div className="mx-auto max-w-5xl px-4 py-8">

          {/* Welcome banner */}
          {welcome && (
            <div className="mb-6 flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0" />
                <div>
                  <p className="font-semibold text-emerald-800">Bienvenue sur DiploChain !</p>
                  <p className="text-sm text-emerald-700">
                    Votre établissement a été créé avec succès. Vos clés cryptographiques (RSA + Ethereum) ont été générées automatiquement.
                  </p>
                </div>
              </div>
              <button onClick={() => setWelcome(false)} className="ml-4 text-emerald-500 hover:text-emerald-700">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Header */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Award className="h-7 w-7 text-blue-600" />
                {university?.name ?? "Espace établissement"}
              </h1>
              {university?.acronym && (
                <p className="text-slate-500 text-sm mt-0.5">
                  {university.acronym} — {university.city ?? university.country}
                  {!university.is_verified && (
                    <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                      En attente de vérification
                    </span>
                  )}
                  {university.is_verified && (
                    <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                      <ShieldCheck className="h-3 w-3" /> Vérifié
                    </span>
                  )}
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="ghost" onClick={() => { refresh(); loadDiplomas(); }}>
                <RefreshCw className="h-4 w-4" />
                Rafraîchir
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowKeys(true)}>
                <Key className="h-4 w-4" />
                Mes clés
              </Button>
              <Button size="sm" variant="ghost" onClick={logout}>
                <LogOut className="h-4 w-4" />
                Déconnexion
              </Button>
              <Button size="sm" onClick={() => setShowIssue(true)}>
                <FilePlus2 className="h-4 w-4" />
                Émettre un diplôme
              </Button>
            </div>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: "Total diplômes", value: stats.total, icon: GraduationCap, color: "blue" },
              { label: "Signés", value: stats.signed, icon: CheckCircle2, color: "emerald" },
              { label: "Révoqués", value: stats.revoked, icon: XCircle, color: "red" },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-${color}-50 text-${color}-600`}>
                  <Icon className="h-5 w-5" />
                </div>
                <p className="text-3xl font-bold text-slate-900">{value}</p>
                <p className="text-sm text-slate-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Diplomas list */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            {/* Filter tabs */}
            <div className="flex border-b border-slate-200 px-4 pt-4 gap-1 overflow-x-auto">
              {(["all", "signed", "draft", "revoked"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
                    filter === f
                      ? "bg-blue-600 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {f === "all" ? "Tous" : f === "signed" ? "Signés" : f === "draft" ? "Brouillons" : "Révoqués"}
                  <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-xs ${
                    filter === f ? "bg-blue-500 text-white" : "bg-slate-100 text-slate-500"
                  }`}>
                    {f === "all" ? diplomas.length : diplomas.filter((d) => d.status === f).length}
                  </span>
                </button>
              ))}
            </div>

            <div className="p-4 space-y-3">
              {loading && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              )}
              {!loading && filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <GraduationCap className="h-12 w-12 text-slate-300 mb-3" />
                  <p className="font-semibold text-slate-600">Aucun diplôme</p>
                  <p className="text-sm text-slate-400 mt-1">
                    {filter === "all"
                      ? "Cliquez sur « Émettre un diplôme » pour commencer."
                      : `Aucun diplôme avec le statut « ${filter} ».`}
                  </p>
                  {filter === "all" && (
                    <Button className="mt-4" size="sm" onClick={() => setShowIssue(true)}>
                      <FilePlus2 className="h-4 w-4" />
                      Émettre le premier diplôme
                    </Button>
                  )}
                </div>
              )}
              {!loading && filtered.map((d) => (
                <DiplomaRow key={d.id} diploma={d} universityName={university?.name ?? "DiploChain"} onRevoke={handleRevoke} />
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {showIssue && <IssueModal onClose={() => setShowIssue(false)} onSuccess={handleIssueSuccess} />}
      {showKeys && <KeysModal onClose={() => setShowKeys(false)} />}
    </>
  );
}
