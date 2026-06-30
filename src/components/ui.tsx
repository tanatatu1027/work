"use client";

import Link from "next/link";
import type { PickStatus } from "@/lib/types";

export function AppHeader({
  title,
  back,
  right,
}: {
  title: string;
  back?: string;
  right?: React.ReactNode;
}) {
  return (
    <header className="sticky top-0 z-20 flex items-center gap-2 border-b border-brand-dark bg-brand px-4 py-3 text-white shadow">
      {back ? (
        <Link
          href={back}
          aria-label="戻る"
          className="-ml-1 flex h-9 w-9 items-center justify-center rounded-full text-xl active:bg-white/20"
        >
          ‹
        </Link>
      ) : (
        <span className="flex h-9 w-9 items-center justify-center text-2xl">💊</span>
      )}
      <h1 className="flex-1 truncate text-lg font-bold">{title}</h1>
      {right}
    </header>
  );
}

const STATUS_LABEL: Record<PickStatus, string> = {
  pending: "未着手",
  in_progress: "作業中",
  done: "完了",
};

const STATUS_STYLE: Record<PickStatus, string> = {
  pending: "bg-slate-200 text-slate-700",
  in_progress: "bg-amber-100 text-amber-800 ring-1 ring-amber-300",
  done: "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300",
};

export function StatusBadge({ status }: { status: PickStatus }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${STATUS_STYLE[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}

export function Progress({ done, total }: { done: number; total: number }) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-brand-light transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-12 shrink-0 text-right text-xs font-semibold tabular-nums text-slate-500">
        {done}/{total}
      </span>
    </div>
  );
}
