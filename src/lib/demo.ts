import type { Prescription } from "./types";

let n = 0;
const id = () => `demo_${Date.now().toString(36)}_${n++}`;

/** デモ用の処方箋を1件生成する(QRが無くても画面確認できるように) */
export function makeDemoPrescription(): Prescription {
  const samples = [
    {
      patientName: "山田 太郎",
      patientKana: "ヤマダ タロウ",
      clinic: "さくら内科クリニック",
      doctor: "佐藤 一郎",
      items: [
        { name: "アムロジピンOD錠", spec: "5mg", amount: "1錠", totalQuantity: "30錠", usage: "1日1回 朝食後", location: "A-12", code: "1234567" },
        { name: "ロスバスタチン錠", spec: "2.5mg", amount: "1錠", totalQuantity: "30錠", usage: "1日1回 夕食後", location: "B-03", code: "2345678" },
        { name: "酸化マグネシウム錠", spec: "330mg", amount: "3錠", totalQuantity: "90錠", usage: "1日3回 毎食後", location: "C-21", code: "3456789" },
      ],
    },
    {
      patientName: "鈴木 花子",
      patientKana: "スズキ ハナコ",
      clinic: "みどり耳鼻科",
      doctor: "田中 三郎",
      items: [
        { name: "カルボシステイン錠", spec: "250mg", amount: "1錠", totalQuantity: "21錠", usage: "1日3回 毎食後 7日分", location: "C-08", code: "4567890" },
        { name: "クラリスロマイシン錠", spec: "200mg", amount: "1錠", totalQuantity: "14錠", usage: "1日2回 朝夕食後 7日分", location: "D-15", code: "5678901" },
      ],
    },
    {
      patientName: "高橋 健",
      patientKana: "タカハシ ケン",
      clinic: "あおぞら整形外科",
      doctor: "渡辺 四郎",
      items: [
        { name: "ロキソプロフェンNa錠", spec: "60mg", amount: "1錠", totalQuantity: "15錠", usage: "疼痛時 1回1錠", location: "A-01", code: "6789012" },
        { name: "レバミピド錠", spec: "100mg", amount: "1錠", totalQuantity: "15錠", usage: "疼痛時 1回1錠", location: "A-05", code: "7890123" },
        { name: "ロキソプロフェンパップ", spec: "100mg", amount: "1枚", totalQuantity: "35枚", usage: "1日1回 患部に貼付", location: "E-30", code: "8901234" },
      ],
    },
  ];

  const s = samples[Math.floor(Math.random() * samples.length)];
  const seq = String(Math.floor(Math.random() * 900) + 100);

  return {
    id: id(),
    receiptNo: seq,
    patientName: s.patientName,
    patientKana: s.patientKana,
    gender: "unknown",
    clinic: s.clinic,
    doctor: s.doctor,
    issuedAt: new Date().toISOString().slice(0, 10),
    receivedAt: new Date().toISOString(),
    status: "pending",
    items: s.items.map((it, i) => ({ id: `${id()}_${i}`, picked: false, ...it })),
    rawQr: "(demo)",
  };
}

/** デモ用のJSON QR文字列(自社連携フォーマットの例) */
export const DEMO_QR_JSON = JSON.stringify(
  {
    receiptNo: "042",
    patientName: "佐々木 美咲",
    patientKana: "ササキ ミサキ",
    clinic: "ひまわりファミリークリニック",
    doctor: "山本 五郎",
    issuedAt: "2026-06-30",
    items: [
      { name: "ファモチジンOD錠", spec: "20mg", amount: "1錠", totalQuantity: "28錠", usage: "1日2回 朝夕食後", location: "B-11", code: "1112223" },
      { name: "モサプリドクエン酸塩錠", spec: "5mg", amount: "1錠", totalQuantity: "42錠", usage: "1日3回 毎食前", location: "C-04", code: "2223334" },
    ],
  },
  null,
  0,
);
