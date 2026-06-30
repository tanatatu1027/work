"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePicking } from "@/lib/store";
import { AppHeader, StatusBadge, Progress } from "@/components/ui";
import type { PickItem } from "@/lib/types";

export default function PickPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const rx = usePicking((s) => s.prescriptions.find((p) => p.id === id));
  const toggleItem = usePicking((s) => s.toggleItem);
  const setAllItems = usePicking((s) => s.setAllItems);
  const setStatus = usePicking((s) => s.setStatus);
  const remove = usePicking((s) => s.remove);

  if (!rx) {
    return (
      <div>
        <AppHeader title="処方箋" back="/" />
        <div className="p-8 text-center text-slate-500">
          <p>この処方箋は見つかりませんでした。</p>
          <Link href="/" className="mt-4 inline-block rounded-full bg-brand px-5 py-2 font-semibold text-white">
            一覧へ戻る
          </Link>
        </div>
      </div>
    );
  }

  const done = rx.items.filter((i) => i.picked).length;
  const allPicked = done === rx.items.length && rx.items.length > 0;
  const isDone = rx.status === "done";

  return (
    <div className="pb-32">
      <AppHeader title={`No.${rx.receiptNo} ${rx.patientName}`} back="/" right={<StatusBadge status={rx.status} />} />

      {/* 患者・処方情報 */}
      <div className="m-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-extrabold">{rx.patientName}</span>
          {rx.patientKana && <span className="text-sm text-slate-400">{rx.patientKana}</span>}
        </div>
        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
          {rx.clinic && <Info label="医療機関" value={rx.clinic} />}
          {rx.doctor && <Info label="処方医" value={rx.doctor} />}
          {rx.issuedAt && <Info label="処方日" value={rx.issuedAt} />}
          {rx.birthday && <Info label="生年月日" value={rx.birthday} />}
        </dl>
        <div className="mt-4">
          <Progress done={done} total={rx.items.length} />
        </div>
      </div>

      {/* 一括操作 */}
      {!isDone && (
        <div className="flex gap-2 px-4">
          <button
            onClick={() => setAllItems(rx.id, true)}
            className="flex-1 rounded-xl bg-white py-2 text-sm font-semibold text-brand ring-1 ring-brand/30 active:bg-brand/5"
          >
            すべて取得済みにする
          </button>
          <button
            onClick={() => setAllItems(rx.id, false)}
            className="flex-1 rounded-xl bg-white py-2 text-sm font-semibold text-slate-500 ring-1 ring-slate-200 active:bg-slate-50"
          >
            すべて解除
          </button>
        </div>
      )}

      {/* 品目リスト */}
      <ul className="mt-3 space-y-3 px-4">
        {rx.items.map((it, idx) => (
          <ItemRow
            key={it.id}
            index={idx + 1}
            item={it}
            disabled={isDone}
            onToggle={() => toggleItem(rx.id, it.id)}
          />
        ))}
      </ul>

      {/* 削除 */}
      <div className="px-4 pt-6">
        <button
          onClick={() => {
            if (confirm("この処方箋を削除しますか?")) {
              remove(rx.id);
              router.replace("/");
            }
          }}
          className="text-sm font-medium text-rose-500 active:underline"
        >
          この処方箋を削除
        </button>
      </div>

      {/* フッター操作 */}
      <div className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-3xl border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur">
        {isDone ? (
          <button
            onClick={() => setStatus(rx.id, "in_progress")}
            className="w-full rounded-2xl bg-slate-200 py-4 text-lg font-bold text-slate-700 active:bg-slate-300"
          >
            完了を取り消して再開
          </button>
        ) : (
          <button
            onClick={() => {
              setStatus(rx.id, "done");
              router.replace("/");
            }}
            disabled={!allPicked}
            className="w-full rounded-2xl bg-emerald-600 py-4 text-lg font-bold text-white shadow-lg transition active:bg-emerald-700 disabled:bg-slate-300 disabled:text-slate-500"
          >
            {allPicked ? "✓ ピッキング完了" : `あと ${rx.items.length - done} 品目`}
          </button>
        )}
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-slate-400">{label}</dt>
      <dd className="truncate font-medium text-slate-700">{value}</dd>
    </div>
  );
}

function ItemRow({
  index,
  item,
  disabled,
  onToggle,
}: {
  index: number;
  item: PickItem;
  disabled: boolean;
  onToggle: () => void;
}) {
  return (
    <li>
      <button
        onClick={onToggle}
        disabled={disabled}
        className={`flex w-full items-stretch gap-3 rounded-2xl border p-3 text-left transition ${
          item.picked
            ? "border-emerald-300 bg-emerald-50"
            : "border-slate-200 bg-white active:bg-slate-50"
        } ${disabled ? "opacity-80" : ""}`}
      >
        {/* チェック */}
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl font-bold transition ${
            item.picked
              ? "animate-pop bg-emerald-500 text-white"
              : "bg-slate-100 text-slate-300 ring-1 ring-slate-200"
          }`}
        >
          {item.picked ? "✓" : index}
        </div>

        {/* 内容 */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <span className={`text-base font-bold leading-snug ${item.picked ? "text-emerald-900" : "text-slate-900"}`}>
              {item.name}
              {item.spec && <span className="ml-1 font-semibold text-slate-500">{item.spec}</span>}
            </span>
            {item.location && (
              <span className="shrink-0 rounded-lg bg-slate-900 px-2 py-1 text-xs font-bold text-white">
                棚 {item.location}
              </span>
            )}
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm text-slate-600">
            {item.totalQuantity && <span className="font-semibold text-brand">{item.totalQuantity}</span>}
            {item.amount && <span>{item.amount}</span>}
          </div>
          {item.usage && <div className="mt-0.5 text-xs text-slate-500">{item.usage}</div>}
        </div>
      </button>
    </li>
  );
}
