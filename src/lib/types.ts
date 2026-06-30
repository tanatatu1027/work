// ピッキングシステムのデータ型定義

export type PickStatus = "pending" | "in_progress" | "done";

/** 個々の調剤品目(1薬剤=1行) */
export interface PickItem {
  id: string;
  /** 薬品名(規格を含む) */
  name: string;
  /** 規格・剤形 例: 5mg 錠 */
  spec?: string;
  /** 1回量や1日量などの数量表記 */
  amount: string;
  /** 調剤総数(例: 30錠) */
  totalQuantity?: string;
  /** 用法 例: 1日3回 毎食後 */
  usage?: string;
  /** 棚番・ロケーション 例: A-12 */
  location?: string;
  /** YJコード / レセプト電算コードなど */
  code?: string;
  /** ピッキング済みか */
  picked: boolean;
}

/** 1枚の処方箋 = 1ピッキングタスク */
export interface Prescription {
  id: string;
  /** 受付番号 / 引換番号 */
  receiptNo: string;
  /** 患者氏名 */
  patientName: string;
  /** 患者カナ */
  patientKana?: string;
  /** 生年月日 */
  birthday?: string;
  /** 性別 */
  gender?: "male" | "female" | "unknown";
  /** 発行医療機関 */
  clinic?: string;
  /** 処方医 */
  doctor?: string;
  /** 処方日 (ISO) */
  issuedAt?: string;
  /** システム受付日時 (ISO) */
  receivedAt: string;
  status: PickStatus;
  items: PickItem[];
  /** 元になったQR生データ(監査用) */
  rawQr?: string;
}
