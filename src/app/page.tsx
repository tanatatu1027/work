"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePicking } from "@/lib/store";
import { makeDemoPrescription } from "@/lib/demo";
import { AppHeader, StatusBadge, Progress } from "@/components/ui";
import type { PickStatus, Prescription } from "@/lib/types";

type Tab = "active" | "done" | "all";

export default function HomePage() {
  const prescriptions = usePicking((s) => s.prescriptions);
  const add = usePicking((s) => s.add);
  const clearDone = usePicking((s) => s.clearDone);
  const [tab, setTab] = useState<Tab>("active");

  const filtered = useMemo(() => {
    if (tab === "active") return prescriptions.filter((p) => p.status !== "done");
    if (tab === "done") return prescriptions.filter((p) => p.status === "done");
    return prescriptions;
  }, [prescriptions, tab]);

  const counts = useMemo(() => {
    const c: Record<PickStatus, number> = { pending: 0, in_progress: 0, done: 0 };
    prescriptions.forEach((p) => (c[p.status] += 1));
    return c;
  }, [prescriptions]);

  return (
    <div className="pb-28">
      <AppHeader
        title="薬局ピッキング"
        right={
          <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
            未{counts.pending + counts.in_progress}件
          </span>
        }
      />

      {/* サマリー */}
      <div className="grid grid-cols-3 gap-2 px-4 pt-4">
        <Stat label="未着手" value={counts.pending} color="text-slate-700" />
        <Stat label="作業中" value={counts.in_progress} color="text-amber-600" />
        <Stat label="完了" value={counts.done} color="text-emerald-600" />
      </div>

      {/* タブ */}
      <div className="sticky top-[57px] z-10 flex gap-1 bg-slate-50/90 px-4 py-3 backdrop-blur">
        <TabButton active={tab === "active"} onClick={() => setTab("active")}>
          対応中
        </TabButton>
        <TabButton active={tab === "done"} onClick={() => setTab("done")}>
          完了
        </TabButton>
        <TabButton active={tab === "all"} onClick={() => setTab("all")}>
          すべて
        </TabButton>
        {tab === "done" && counts.done > 0 && (
          <button
            onClick={() => {
              if (confirm("完了した処方箋をすべて削除しますか?")) clearDone();
            }}
            className="ml-auto rounded-full px-3 py-1.5 text-xs font-semibold text-rose-600 active:bg-rose-50"
          >
            完了を削除
          </button>
        )}
      </div>

      {/* 一覧 */}
      <div className="space-y-3 px-4">
        {filtered.length === 0 ? (
          <EmptyState onDemo={() => add(makeDemoPrescription())} />
        ) : (
          filtered.map((rx) => <PrescriptionCard key={rx.id} rx={rx} />)
        )}
      </div>

      {/* スキャンボタン(固定) */}
      <div className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-3xl border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur">
        <div className="flex gap-2">
          <Link
            href="/scan"
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-brand py-4 text-lg font-bold text-white shadow-lg active:bg-brand-dark"
          >
            <span className="text-2xl">▣</span> 処方箋QRをスキャン
          </Link>
          <button
            onClick={() => add(makeDemoPrescription())}
            className="rounded-2xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-600 active:bg-slate-100"
          >
            デモ
            <br />
            追加
          </button>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-2xl bg-white p-3 text-center shadow-sm ring-1 ring-slate-100">
      <div className={`text-2xl font-extrabold tabular-nums ${color}`}>{value}</div>
      <div className="text-xs font-medium text-slate-500">{label}</div>
    </div>
  );
}

function TabButton({
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
      className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
        active ? "bg-brand text-white shadow" : "bg-white text-slate-600 ring-1 ring-slate-200"
      }`}
    >
      {children}
    </button>
  );
}

function PrescriptionCard({ rx }: { rx: Prescription }) {
  const done = rx.items.filter((i) => i.picked).length;
  return (
    <Link
      href={`/pick/${rx.id}`}
      className="block rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100 active:bg-slate-50"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-500">
              No.{rx.receiptNo}
            </span>
            <span className="truncate text-lg font-bold">{rx.patientName}</span>
          </div>
          {rx.clinic && <div className="mt-0.5 truncate text-sm text-slate-500">{rx.clinic}</div>}
        </div>
        <StatusBadge status={rx.status} />
      </div>

      <div className="mt-3">
        <Progress done={done} total={rx.items.length} />
      </div>

      <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
        <span>{rx.items.length}品目</span>
        <span>{formatTime(rx.receivedAt)} 受付</span>
      </div>
    </Link>
  );
}

function EmptyState({ onDemo }: { onDemo: () => void }) {
  return (
    <div className="mt-10 rounded-2xl border-2 border-dashed border-slate-200 bg-white px-6 py-12 text-center">
      <div className="text-5xl">📋</div>
      <p className="mt-4 font-semibold text-slate-600">処方箋がありません</p>
      <p className="mt-1 text-sm text-slate-400">
        下の「処方箋QRをスキャン」から読み取るか、
        <br />
        まずはデモで動作を確認できます。
      </p>
      <button
        onClick={onDemo}
        className="mt-5 rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-white active:bg-brand-dark"
      >
        デモ処方箋を追加
      </button>
    </div>
  );
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" });
}
