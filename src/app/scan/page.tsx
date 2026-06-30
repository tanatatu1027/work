"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { usePicking } from "@/lib/store";
import { parseQr } from "@/lib/parseQr";
import { makeDemoPrescription, DEMO_QR_JSON } from "@/lib/demo";
import { AppHeader } from "@/components/ui";

const QrScanner = dynamic(() => import("@/components/QrScanner"), { ssr: false });

export default function ScanPage() {
  const router = useRouter();
  const add = usePicking((s) => s.add);
  const [mode, setMode] = useState<"camera" | "manual">("camera");
  const [manual, setManual] = useState("");
  const [error, setError] = useState<string | null>(null);

  const accept = useCallback(
    (raw: string) => {
      try {
        const rx = parseQr(raw);
        const id = add(rx);
        router.replace(`/pick/${id}`);
      } catch (e) {
        setError(e instanceof Error ? e.message : "読み取りに失敗しました");
      }
    },
    [add, router],
  );

  return (
    <div className="pb-10">
      <AppHeader title="処方箋QRをスキャン" back="/" />

      <div className="flex gap-1 px-4 pt-4">
        <Seg active={mode === "camera"} onClick={() => setMode("camera")}>
          カメラ
        </Seg>
        <Seg active={mode === "manual"} onClick={() => setMode("manual")}>
          手入力 / 貼り付け
        </Seg>
      </div>

      <div className="px-4 pt-4">
        {mode === "camera" ? (
          <>
            <QrScanner onResult={accept} onError={(m) => setError(m)} />
            <p className="mt-3 text-center text-sm text-slate-500">
              処方箋の2次元コードを枠内に合わせてください
            </p>
          </>
        ) : (
          <div className="space-y-3">
            <textarea
              value={manual}
              onChange={(e) => setManual(e.target.value)}
              placeholder="QRの内容(JSON または 処方箋2次元シンボルのCSV)を貼り付け"
              className="h-40 w-full rounded-2xl border border-slate-300 p-3 text-sm"
            />
            <div className="flex gap-2">
              <button
                onClick={() => manual.trim() && accept(manual.trim())}
                disabled={!manual.trim()}
                className="flex-1 rounded-2xl bg-brand py-3 font-bold text-white disabled:opacity-40"
              >
                取り込む
              </button>
              <button
                onClick={() => setManual(DEMO_QR_JSON)}
                className="rounded-2xl border border-slate-300 px-4 text-sm font-semibold text-slate-600"
              >
                例を挿入
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700 ring-1 ring-rose-200">
            {error}
          </div>
        )}

        <div className="mt-6 border-t border-slate-200 pt-5">
          <button
            onClick={() => {
              const id = add(makeDemoPrescription());
              router.replace(`/pick/${id}`);
            }}
            className="w-full rounded-2xl border border-dashed border-slate-300 py-3 text-sm font-semibold text-slate-500 active:bg-slate-100"
          >
            QRが無いのでデモ処方箋で試す
          </button>
        </div>
      </div>
    </div>
  );
}

function Seg({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 rounded-full py-2 text-sm font-semibold transition ${
        active ? "bg-brand text-white shadow" : "bg-white text-slate-600 ring-1 ring-slate-200"
      }`}
    >
      {children}
    </button>
  );
}
