"use client";

import { useEffect, useRef } from "react";

interface QrCodeProps {
  value: string;
  size?: number;
}

export function QrCode({ value, size = 180 }: QrCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !value) return;
    let cancelled = false;

    import("qrcode").then(({ default: QRCode }) => {
      if (cancelled || !canvasRef.current) return;
      QRCode.toCanvas(canvasRef.current, value, {
        width: size,
        margin: 2,
        color: { dark: "#0f172a", light: "#ffffff" },
      });
    });

    return () => {
      cancelled = true;
    };
  }, [value, size]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: size, height: size }}
      className="rounded-lg"
    />
  );
}
