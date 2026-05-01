"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCircle2, Loader2, UserPlus, XCircle } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ApiError } from "@/lib/api/types";
import { authApi } from "@/lib/api/auth";

const FIELD_LABELS: Record<string, string> = {
  email: "Email",
  password: "Mot de passe",
  password_confirm: "Confirmation du mot de passe",
  name: "Nom de l'établissement",
  acronym: "Acronyme",
  country: "Pays",
  city: "Ville",
  website: "Site web",
};

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    acronym: "",
    country: "Burkina Faso",
    city: "",
    website: "",
    email: "",
    password: "",
    password_confirm: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((s) => ({ ...s, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (form.password !== form.password_confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (form.password.length < 8) {
      setError("Le mot de passe doit faire au moins 8 caractères.");
      return;
    }

    setSubmitting(true);
    try {
      await authApi.register({
        name: form.name,
        acronym: form.acronym || undefined,
        country: form.country,
        city: form.city || undefined,
        website: form.website || undefined,
        email: form.email,
        password: form.password,
        password_confirm: form.password_confirm,
      });
      setSuccess(true);
      setTimeout(() => router.push("/auth/login"), 2500);
    } catch (err) {
      if (err instanceof ApiError) {
        const data = err.data as Record<string, unknown> | null;
        if (data && typeof data === "object") {
          const firstKey = Object.keys(data)[0];
          const value = data[firstKey];
          const rawMsg = Array.isArray(value) ? String(value[0]) : String(value ?? err.message);
          const label = FIELD_LABELS[firstKey] ?? firstKey;
          setError(`${label} : ${rawMsg}`);
        } else {
          setError(err.message || "Erreur lors de la création du compte.");
        }
      } else {
        setError("Erreur réseau. Vérifiez votre connexion et réessayez.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
      <div className="text-center">
        <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <UserPlus className="h-6 w-6" />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">
          Enregistrement d&apos;un établissement
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Vos clés cryptographiques (RSA + Ethereum) sont générées automatiquement.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <Input
          label="Nom de l'établissement"
          required
          value={form.name}
          onChange={update("name")}
          placeholder="Université Saint Thomas d'Aquin"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Acronyme"
            value={form.acronym}
            onChange={update("acronym")}
            placeholder="USTA"
          />
          <Input
            label="Ville"
            value={form.city}
            onChange={update("city")}
            placeholder="Ouagadougou"
          />
        </div>
        <Input
          label="Pays"
          required
          value={form.country}
          onChange={update("country")}
        />
        <Input
          label="Site web"
          type="url"
          value={form.website}
          onChange={update("website")}
          placeholder="https://usta.bf"
        />
        <Input
          label="Email"
          type="email"
          required
          value={form.email}
          onChange={update("email")}
          placeholder="contact@usta.bf"
          autoComplete="email"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Mot de passe"
            type="password"
            required
            value={form.password}
            onChange={update("password")}
            placeholder="••••••••"
            autoComplete="new-password"
            hint="Min. 8 caractères"
          />
          <Input
            label="Confirmation"
            type="password"
            required
            value={form.password_confirm}
            onChange={update("password_confirm")}
            placeholder="••••••••"
            autoComplete="new-password"
          />
        </div>

        {success && (
          <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <p className="text-sm font-medium text-emerald-700">
              Compte créé avec succès ! Redirection vers la connexion…
            </p>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5">
            <XCircle className="h-4 w-4 shrink-0 text-red-500" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <Button type="submit" fullWidth size="lg" disabled={submitting || success}>
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Création du compte…
            </>
          ) : success ? (
            <>
              <CheckCircle2 className="h-4 w-4" />
              Compte créé
            </>
          ) : (
            "Créer le compte"
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Déjà inscrit ?{" "}
        <Link
          href="/auth/login"
          className="font-semibold text-blue-600 hover:text-blue-700"
        >
          Se connecter
        </Link>
      </p>
    </div>
  );
}
