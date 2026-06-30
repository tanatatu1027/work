"use client";

import { useEffect, useRef, useState } from "react";

/**
 * html5-qrcode を使ったカメラQR読み取り。
 * iPad/iPhone の Safari では HTTPS かつユーザー操作起点でカメラが起動する。
 * Vercel は HTTPS なので本番URLで動作する。
 */
export default function QrScanner({
  onResult,
  onError,
}: {
  onResult: (text: string) => void;
  onError?: (message: string) => void;
}) {
  const containerId = useRef(`qr-${Math.random().toString(36).slice(2)}`);
  const scannerRef = useRef<{ stop: () => Promise<void>; clear: () => void } | null>(null);
  const handledRef = useRef(false);
  const [status, setStatus] = useState<"starting" | "running" | "error">("starting");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        if (cancelled) return;

        const scanner = new Html5Qrcode(containerId.current, { verbose: false });
        scannerRef.current = scanner as unknown as typeof scannerRef.current;

        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 240, height: 240 } },
          (decodedText) => {
            if (handledRef.current) return;
            handledRef.current = true;
            // 連続検出を止めてから結果を返す
            scanner
              .stop()
              .catch(() => undefined)
              .finally(() => onResult(decodedText));
          },
          () => {
            /* フレームごとの未検出は無視 */
          },
        );

        if (!cancelled) setStatus("running");
      } catch (e) {
        if (cancelled) return;
        setStatus("error");
        const msg =
          e instanceof Error ? e.message : "カメラを起動できませんでした";
        onError?.(msg);
      }
    })();

    return () => {
      cancelled = true;
      const s = scannerRef.current;
      if (s) {
        s.stop()
          .catch(() => undefined)
          .finally(() => {
            try {
              s.clear();
            } catch {
              /* noop */
            }
          });
      }
    };
    // onResult/onError は親で安定参照にしている前提
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-black">
      <div id={containerId.current} className="aspect-square w-full [&_video]:h-full [&_video]:w-full [&_video]:object-cover" />

      {/* 読み取り枠オーバーレイ */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-60 w-60 rounded-2xl border-4 border-white/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" />
      </div>

      {status === "starting" && (
        <div className="absolute inset-0 flex items-center justify-center text-white">
          <p className="animate-pulse text-sm">カメラを起動中…</p>
        </div>
      )}
      {status === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-6 text-center text-white">
          <p className="text-4xl">📷</p>
          <p className="text-sm">
            カメラを起動できませんでした。
            <br />
            ブラウザのカメラ許可をオンにしてください。
          </p>
        </div>
      )}
    </div>
  );
}
