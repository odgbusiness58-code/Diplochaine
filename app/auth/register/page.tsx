"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ApiError } from "@/lib/api/types";
import { useAuth } from "@/lib/auth/context";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

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
      await register(form);
      router.push("/etablissement?welcome=1");
    } catch (err) {
      if (err instanceof ApiError) {
        const data = err.data as Record<string, unknown> | null;
        if (data && typeof data === "object") {
          const firstKey = Object.keys(data)[0];
          const value = data[firstKey];
          const msg = Array.isArray(value) ? String(value[0]) : String(value ?? err.message);
          setError(`${firstKey}: ${msg}`);
        } else {
          setError(err.message || "Erreur d'enregistrement.");
        }
      } else {
        setError("Erreur réseau. Réessayez.");
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

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <Button type="submit" fullWidth size="lg" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Création du compte…
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
