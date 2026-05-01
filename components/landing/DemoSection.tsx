"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, AlertCircle, Loader2, QrCode, Camera, X } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { diplomasApi } from "@/lib/api/diplomas";
import { ApiError } from "@/lib/api/types";
import { SectionHeader } from "./SectionHeader";
import { cn } from "@/lib/utils";

type Status = "idle" | "loading" | "success" | "error";

interface Result {
  status: Status;
  message: string;
  diplomaId?: string;
}

const DIPLO_REGEX = /^DIPLO-([0-9a-fA-F-]+)$/i;
const UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/i;

function extractDiplomaId(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const prefixed = trimmed.match(DIPLO_REGEX);
  if (prefixed) return prefixed[1];
  if (UUID_REGEX.test(trimmed)) return trimmed;
  return null;
}

async function verifyDiplomaId(rawValue: string): Promise<Result> {
  const id = extractDiplomaId(rawValue);
  if (!id) {
    return {
      status: "error",
      message: "Format invalide. Attendu : DIPLO-<uuid> ou un UUID complet.",
    };
  }

  try {
    const diploma = await diplomasApi.get(id);
    if (diploma.status === "revoked") {
      return {
        status: "error",
        message: `⚠ Diplôme ${id} révoqué.`,
        diplomaId: id,
      };
    }
    return {
      status: "success",
      message: `✓ Diplôme ${diploma.diploma_title} — ${diploma.student_full_name}`,
      diplomaId: id,
    };
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      return {
        status: "error",
        message: "Diplôme introuvable. Risque de fraude.",
      };
    }
    return {
      status: "error",
      message: err instanceof Error ? err.message : "Erreur réseau.",
    };
  }
}

function ResultPill({ result }: { result: Result }) {
  if (result.status === "idle") {
    return (
      <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-500">
        Le résultat de la vérification s&apos;affichera ici.
      </p>
    );
  }

  const style = {
    loading: "bg-blue-50 text-blue-700",
    success: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    error: "bg-red-50 text-red-700 ring-1 ring-red-200",
    idle: "",
  }[result.status];

  const Icon = {
    loading: Loader2,
    success: CheckCircle2,
    error: AlertCircle,
    idle: AlertCircle,
  }[result.status];

  return (
    <div className={cn("flex items-start gap-2 rounded-lg p-3 text-sm font-medium", style)}>
      <Icon className={cn("mt-0.5 h-4 w-4 flex-shrink-0", result.status === "loading" && "animate-spin")} />
      <span>{result.message}</span>
    </div>
  );
}

export function DemoSection() {
  const [diplomaInput, setDiplomaInput] = useState("");
  const [verifyResult, setVerifyResult] = useState<Result>({
    status: "idle",
    message: "",
  });

  const [scanResult, setScanResult] = useState<Result>({
    status: "idle",
    message: "",
  });
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<{ stop: () => Promise<void>; clear: () => void } | null>(null);

  const handleVerify = async () => {
    setVerifyResult({ status: "loading", message: "Vérification en cours…" });
    const result = await verifyDiplomaId(diplomaInput);
    setVerifyResult(result);
  };

  const stopScanner = async () => {
    try {
      await scannerRef.current?.stop();
      scannerRef.current?.clear();
    } catch {
      // ignore
    }
    scannerRef.current = null;
    setIsScanning(false);
  };

  const handleScan = async () => {
    if (isScanning) {
      await stopScanner();
      setScanResult({ status: "idle", message: "Scan interrompu." });
      return;
    }

    setScanResult({ status: "loading", message: "Activation de la caméra…" });
    setIsScanning(true);

    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const html5Qr = new Html5Qrcode("qr-reader");
      scannerRef.current = {
        stop: () => html5Qr.stop(),
        clear: () => html5Qr.clear(),
      };

      await html5Qr.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        async (decoded) => {
          await stopScanner();
          setScanResult({ status: "loading", message: "Vérification du QR…" });
          const result = await verifyDiplomaId(decoded);
          setScanResult(result);
        },
        () => {
          /* ignore frame errors */
        }
      );
    } catch (err) {
      await stopScanner();
      setScanResult({
        status: "error",
        message:
          err instanceof Error && err.message
            ? `Caméra inaccessible : ${err.message}`
            : "Caméra inaccessible. Vérifiez les autorisations.",
      });
    }
  };

  useEffect(() => {
    return () => {
      void stopScanner();
    };
  }, []);

  return (
    <section id="demo" className="bg-slate-50 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeader
          title="Testez DiploChain en direct"
          description="Saisissez un identifiant de diplôme ou scannez un QR code pour une vérification réelle contre notre API."
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">
              Vérification par identifiant
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              Format : <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs">DIPLO-&lt;uuid&gt;</code> ou UUID complet.
            </p>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Input
                placeholder="DIPLO-550e8400-e29b-41d4-a716-446655440000"
                value={diplomaInput}
                onChange={(e) => setDiplomaInput(e.target.value)}
                className="flex-1 font-mono text-xs"
                onKeyDown={(e) => e.key === "Enter" && handleVerify()}
              />
              <Button
                onClick={handleVerify}
                disabled={verifyResult.status === "loading"}
                className="sm:w-auto"
              >
                {verifyResult.status === "loading" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                Vérifier
              </Button>
            </div>

            <div className="mt-4">
              <ResultPill result={verifyResult} />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">
              Scan QR code
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              Activez la caméra et pointez vers un QR DiploChain.
            </p>

            <div className="relative mt-5 flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-300 bg-slate-50">
              <div id="qr-reader" className="h-full w-full" />
              {!isScanning && (
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-400">
                  <QrCode className="h-12 w-12" />
                  <p className="text-sm">Zone de scan</p>
                </div>
              )}
            </div>

            <Button
              onClick={handleScan}
              variant={isScanning ? "danger" : "secondary"}
              fullWidth
              className="mt-4"
            >
              {isScanning ? (
                <>
                  <X className="h-4 w-4" />
                  Arrêter le scan
                </>
              ) : (
                <>
                  <Camera className="h-4 w-4" />
                  Scanner un QR code
                </>
              )}
            </Button>

            <div className="mt-4">
              <ResultPill result={scanResult} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
