"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { CheckCircle2, Loader2, LogIn, XCircle } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ApiError } from "@/lib/api/types";
import { useAuth } from "@/lib/auth/context";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSubmitting(true);

    try {
      await login({ email, password });
      setSuccess(true);
      const next = searchParams.get("next") ?? "/etablissement";
      setTimeout(() => router.push(next), 1200);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setError("Email ou mot de passe incorrect.");
        } else if (err.status === 0 || err.message.toLowerCase().includes("network") || err.message.toLowerCase().includes("réseau")) {
          setError("Erreur réseau. Vérifiez votre connexion et réessayez.");
        } else {
          setError(err.message || "Identifiants invalides.");
        }
      } else {
        setError("Erreur réseau. Vérifiez votre connexion et réessayez.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
      <Input
        label="Email"
        type="email"
        name="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="contact@usta.bf"
        autoComplete="email"
        disabled={success}
      />
      <Input
        label="Mot de passe"
        type="password"
        name="password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
        autoComplete="current-password"
        disabled={success}
      />

      {success && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <p className="text-sm font-medium text-emerald-700">
            Connexion réussie ! Redirection en cours…
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
            Connexion…
          </>
        ) : success ? (
          <>
            <CheckCircle2 className="h-4 w-4" />
            Connecté
          </>
        ) : (
          "Se connecter"
        )}
      </Button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
      <div className="text-center">
        <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <LogIn className="h-6 w-6" />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">
          Espace établissement
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Connectez-vous pour émettre et gérer vos diplômes.
        </p>
      </div>

      <Suspense fallback={<div className="mt-8 h-40 animate-pulse rounded-xl bg-slate-100" />}>
        <LoginForm />
      </Suspense>

      <p className="mt-6 text-center text-sm text-slate-600">
        Pas encore d&apos;établissement enregistré ?{" "}
        <Link
          href="/auth/register"
          className="font-semibold text-blue-600 hover:text-blue-700"
        >
          Créer un compte
        </Link>
      </p>
    </div>
  );
}
