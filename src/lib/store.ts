"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Prescription, PickStatus } from "./types";

interface PickingState {
  prescriptions: Prescription[];
  /** 処方箋を追加(既存と同一QRなら重複追加を防ぐ) */
  add: (rx: Prescription) => string;
  /** 品目のピッキング済みトグル */
  toggleItem: (rxId: string, itemId: string) => void;
  /** 全品目を一括設定 */
  setAllItems: (rxId: string, picked: boolean) => void;
  /** ステータス変更 */
  setStatus: (rxId: string, status: PickStatus) => void;
  /** 削除 */
  remove: (rxId: string) => void;
  /** 完了済みを一括削除 */
  clearDone: () => void;
  get: (rxId: string) => Prescription | undefined;
}

function recompute(rx: Prescription): Prescription {
  const total = rx.items.length;
  const done = rx.items.filter((i) => i.picked).length;
  let status: PickStatus = rx.status;
  if (status !== "done") {
    if (done === 0) status = "pending";
    else if (done < total) status = "in_progress";
    else status = "in_progress"; // 全部チェックでも「完了」ボタンを押すまでは作業中
  }
  return { ...rx, status };
}

export const usePicking = create<PickingState>()(
  persist(
    (set, get) => ({
      prescriptions: [],

      add: (rx) => {
        const existing = get().prescriptions;
        // 同一QRの重複取り込み防止(rawQrが一致し未完了のものがあれば再利用)
        const dup =
          rx.rawQr && rx.rawQr !== "(demo)"
            ? existing.find((p) => p.rawQr === rx.rawQr && p.status !== "done")
            : undefined;
        if (dup) return dup.id;
        set({ prescriptions: [rx, ...existing] });
        return rx.id;
      },

      toggleItem: (rxId, itemId) =>
        set((s) => ({
          prescriptions: s.prescriptions.map((p) =>
            p.id === rxId
              ? recompute({
                  ...p,
                  items: p.items.map((it) =>
                    it.id === itemId ? { ...it, picked: !it.picked } : it,
                  ),
                })
              : p,
          ),
        })),

      setAllItems: (rxId, picked) =>
        set((s) => ({
          prescriptions: s.prescriptions.map((p) =>
            p.id === rxId
              ? recompute({ ...p, items: p.items.map((it) => ({ ...it, picked })) })
              : p,
          ),
        })),

      setStatus: (rxId, status) =>
        set((s) => ({
          prescriptions: s.prescriptions.map((p) =>
            p.id === rxId ? { ...p, status } : p,
          ),
        })),

      remove: (rxId) =>
        set((s) => ({ prescriptions: s.prescriptions.filter((p) => p.id !== rxId) })),

      clearDone: () =>
        set((s) => ({ prescriptions: s.prescriptions.filter((p) => p.status !== "done") })),

      get: (rxId) => get().prescriptions.find((p) => p.id === rxId),
    }),
    { name: "pharmacy-picking-v1" },
  ),
);
