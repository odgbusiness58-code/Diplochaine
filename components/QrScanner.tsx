"use client";

import { useEffect, useRef, useState } from "react";

interface QrScannerProps {
  onResult: (text: string) => void;
  onError?: (message: string) => void;
  active: boolean;
  className?: string;
}

const READER_ID = "diplochain-qr-reader";

export function QrScanner({ onResult, onError, active, className }: QrScannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scannerRef = useRef<{ stop: () => Promise<void>; clear: () => Promise<void> } | null>(null);
  const [status, setStatus] = useState<"idle" | "starting" | "running" | "error">("idle");

  useEffect(() => {
    let cancelled = false;

    async function start() {
      if (!active || !containerRef.current) return;

      setStatus("starting");

      try {
        const mod = await import("html5-qrcode");
        if (cancelled || !containerRef.current) return;

        const Html5Qrcode = mod.Html5Qrcode;
        const scanner = new Html5Qrcode(READER_ID);
        scannerRef.current = scanner as unknown as {
          stop: () => Promise<void>;
          clear: () => Promise<void>;
        };

        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 240, height: 240 } },
          async (decodedText: string) => {
            try {
              await scanner.stop();
              await scanner.clear();
            } catch {
              /* noop */
            }
            scannerRef.current = null;
            setStatus("idle");
            onResult(decodedText.trim());
          },
          () => {
            /* ignore frame errors */
          }
        );

        setStatus("running");
      } catch (err) {
        if (cancelled) return;
        setStatus("error");
        onError?.(err instanceof Error ? err.message : "Caméra indisponible");
      }
    }

    if (active) start();

    return () => {
      cancelled = true;
      const scanner = scannerRef.current;
      if (scanner) {
        scanner.stop().catch(() => {}).finally(() => {
          scanner.clear().catch(() => {});
          scannerRef.current = null;
        });
      }
    };
  }, [active, onResult, onError]);

  return (
    <div className={className}>
      <div
        id={READER_ID}
        ref={containerRef}
        className="overflow-hidden rounded-xl bg-slate-900"
        style={{ minHeight: active ? 280 : 0 }}
      />
      {active && status !== "running" && (
        <p className="mt-2 text-center text-sm text-slate-500">
          {status === "starting" ? "Activation de la caméra…" : status === "error" ? "Caméra inaccessible" : ""}
        </p>
      )}
    </div>
  );
}
