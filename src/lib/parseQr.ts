import type { Prescription, PickItem } from "./types";

let counter = 0;
function uid(prefix = "i"): string {
  counter += 1;
  return `${prefix}_${Date.now().toString(36)}_${counter}`;
}

/**
 * 処方箋QRの読み取り結果を Prescription に変換する。
 *
 * 対応フォーマット:
 *  1) このシステム独自の JSON 形式(自社システムからの連携を想定。最も確実)
 *  2) 日本標準の「処方箋2次元シンボル(JAHIS)」CSV レコード形式
 *  3) 上記で解釈できない場合は生テキストとして1件取り込む
 */
export function parseQr(raw: string): Prescription {
  const text = raw.trim();

  // 1) JSON 形式
  if (text.startsWith("{")) {
    try {
      const parsed = parseJson(text);
      if (parsed) return parsed;
    } catch {
      /* JSON でなければ次へ */
    }
  }

  // 2) JAHIS CSV レコード形式
  if (/^\s*\d+\s*,/.test(text) || text.includes("JAHIS")) {
    const parsed = parseJahis(text);
    if (parsed) return parsed;
  }

  // 3) フォールバック
  return {
    id: uid("rx"),
    receiptNo: "—",
    patientName: "（未解析の処方箋）",
    receivedAt: new Date().toISOString(),
    status: "pending",
    rawQr: raw,
    items: [
      {
        id: uid(),
        name: "QRの内容を解析できませんでした",
        amount: "",
        usage: raw.slice(0, 120),
        picked: false,
      },
    ],
  };
}

/** 独自 JSON 形式のパース */
function parseJson(text: string): Prescription | null {
  const o = JSON.parse(text) as Record<string, unknown>;
  const itemsSrc = (o.items as Record<string, unknown>[] | undefined) ?? [];
  const items: PickItem[] = itemsSrc.map((it) => ({
    id: uid(),
    name: String(it.name ?? "（薬品名なし）"),
    spec: it.spec != null ? String(it.spec) : undefined,
    amount: String(it.amount ?? it.dose ?? ""),
    totalQuantity: it.totalQuantity != null ? String(it.totalQuantity) : undefined,
    usage: it.usage != null ? String(it.usage) : undefined,
    location: it.location != null ? String(it.location) : undefined,
    code: it.code != null ? String(it.code) : undefined,
    picked: false,
  }));

  return {
    id: uid("rx"),
    receiptNo: String(o.receiptNo ?? o.receipt_no ?? "—"),
    patientName: String(o.patientName ?? o.patient_name ?? "（氏名なし）"),
    patientKana: o.patientKana != null ? String(o.patientKana) : undefined,
    birthday: o.birthday != null ? String(o.birthday) : undefined,
    gender: normalizeGender(o.gender),
    clinic: o.clinic != null ? String(o.clinic) : undefined,
    doctor: o.doctor != null ? String(o.doctor) : undefined,
    issuedAt: o.issuedAt != null ? String(o.issuedAt) : undefined,
    receivedAt: new Date().toISOString(),
    status: "pending",
    items: items.length ? items : [{ id: uid(), name: "（品目なし）", amount: "", picked: false }],
    rawQr: text,
  };
}

/**
 * JAHIS 処方箋2次元シンボルの簡易パーサ。
 * レコードは1行=1レコードで、先頭フィールドがレコード番号。
 * バージョン差異があるため、主要レコード番号を緩く解釈する。
 *   11  患者氏名
 *   5   医療機関名
 *   51  処方医名
 *   101 RP(処方)情報の開始
 *   201 薬品レコード(薬品名・分量・単位)
 *   281/311 用法レコード
 */
function parseJahis(text: string): Prescription | null {
  const lines = text
    .split(/\r\n|\r|\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  let patientName = "";
  let patientKana = "";
  let clinic = "";
  let doctor = "";
  let receiptNo = "";
  let issuedAt = "";

  const items: PickItem[] = [];
  let pendingUsage = "";

  for (const line of lines) {
    const f = line.split(",");
    const rec = f[0];
    const val = (i: number) => (f[i] ?? "").trim();

    switch (rec) {
      case "1": // 引換番号 / バージョン
        if (val(1) && !val(1).includes("JAHIS")) receiptNo = val(1);
        break;
      case "5": // 医療機関
        clinic = val(2) || val(1) || clinic;
        break;
      case "51": // 処方医
        doctor = val(2) || val(1) || doctor;
        break;
      case "11": // 患者氏名
        patientName = val(1) || patientName;
        patientKana = val(2) || patientKana;
        break;
      case "21": // 患者生年月日や受付日が入ることがある
        if (!issuedAt && /\d{6,8}/.test(val(1))) issuedAt = formatJDate(val(1));
        break;
      case "201": { // 薬品レコード
        // 201, 区分, コード種別, 薬品コード, 薬品名称, 分量, 単位
        const name = val(4) || val(3) || "（薬品名なし）";
        const code = val(3) || undefined;
        const amount = [val(5), val(6)].filter(Boolean).join(" ");
        items.push({ id: uid(), name, code, amount, usage: pendingUsage || undefined, picked: false });
        break;
      }
      case "281": // 用法
      case "311": {
        const usage = val(2) || val(1);
        if (usage) {
          // 直近の薬品に紐付け、無ければ次の薬品用に保持
          if (items.length) items[items.length - 1].usage = usage;
          else pendingUsage = usage;
        }
        break;
      }
      default:
        break;
    }
  }

  if (!items.length) return null;

  return {
    id: uid("rx"),
    receiptNo: receiptNo || "—",
    patientName: patientName || "（氏名なし）",
    patientKana: patientKana || undefined,
    clinic: clinic || undefined,
    doctor: doctor || undefined,
    issuedAt: issuedAt || undefined,
    receivedAt: new Date().toISOString(),
    status: "pending",
    items,
    rawQr: text,
  };
}

function normalizeGender(g: unknown): Prescription["gender"] {
  const s = String(g ?? "").toLowerCase();
  if (s === "male" || s === "m" || s === "1" || s === "男") return "male";
  if (s === "female" || s === "f" || s === "2" || s === "女") return "female";
  return "unknown";
}

/** YYYYMMDD → YYYY-MM-DD */
function formatJDate(s: string): string {
  const d = s.replace(/[^0-9]/g, "");
  if (d.length === 8) return `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`;
  return s;
}
