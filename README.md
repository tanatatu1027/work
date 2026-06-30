# 薬局ピッキングシステム(自社利用)

スマホ / iPad で使う、調剤ピッキング支援アプリのプロトタイプです。
[pickinggo](https://cp.pickinggo.pdszero.com/) や [EveryPick](https://everypick.pharumo.jp/) のような
タッチ操作中心のピッキング画面を、自社薬局向けに作成したものです。

- **販売目的ではなく自社薬局のみで利用する想定**です。
- 処方箋の **QRコード(2次元シンボル)をカメラで読み取って** 取り込みます。
- データはまずブラウザ内(localStorage)に保存され、サーバ無しで動作します。
  将来は調剤レセコン等のサーバ連携に差し替え可能な構造にしています。

## 主な画面

| 画面 | 内容 |
| --- | --- |
| 一覧(`/`) | 受付済み処方箋の一覧。未着手 / 作業中 / 完了で絞り込み。 |
| スキャン(`/scan`) | カメラでQR読取。手入力/貼り付け、デモ投入にも対応。 |
| ピッキング(`/pick/[id]`) | 薬品ごとに棚番・数量・用法を表示し、タップで取得済みに。全件チェックで完了。 |

## 技術構成

- Next.js 14 (App Router) / React 18 / TypeScript
- Tailwind CSS(iPad・スマホ最適化のタッチUI)
- html5-qrcode(カメラQR読み取り)
- zustand + localStorage(端末内データ保存)

## ローカルで動かす

```bash
npm install
npm run dev
# http://localhost:3000
```

> カメラ(QR読取)はブラウザのセキュリティ上 **HTTPS でないと起動しません**。
> ローカルの `http://localhost` は例外的に許可されますが、iPad の実機で試すときは
> 下記の Vercel など HTTPS の公開URLで開いてください。

## Vercel で公開する(iPad で確認する手順)

このリポジトリは Vercel 用の追加設定が不要です(Next.js を自動検出します)。

1. [vercel.com](https://vercel.com) に GitHub アカウントでログイン
2. **Add New… → Project** を選び、このリポジトリ(`tanatatu1027/work`)を **Import**
3. Framework が **Next.js** になっていることを確認して **Deploy**
4. 数十秒で `https://<プロジェクト名>.vercel.app` の公開URLが発行されます
5. iPad の Safari でそのURLを開く → 「ホーム画面に追加」でアプリのように使えます

> デプロイ対象ブランチは Vercel の Project Settings → Git で
> `claude/pharmacy-picking-system-tu7rwl`(または main にマージ後の既定ブランチ)を指定してください。

## 処方箋QRの取り込みフォーマット

`src/lib/parseQr.ts` が以下を解釈します。

### 1. 自社連携用 JSON(推奨・最も確実)

自社システム側でこの形式のQRを出力できれば、確実に取り込めます。

```json
{
  "receiptNo": "042",
  "patientName": "佐々木 美咲",
  "clinic": "ひまわりクリニック",
  "issuedAt": "2026-06-30",
  "items": [
    { "name": "ファモチジンOD錠", "spec": "20mg", "amount": "1錠",
      "totalQuantity": "28錠", "usage": "1日2回 朝夕食後", "location": "B-11", "code": "1112223" }
  ]
}
```

### 2. 処方箋2次元シンボル(JAHIS規格)

紙の処方箋に印字される標準QRの CSV レコード形式に簡易対応しています。
バージョン差異があるため、実際の処方箋でレコード番号の対応が合わない場合は
`parseJahis()` のレコード番号マッピングを調整してください。

### 3. 上記以外

解釈できない場合も生データを1件として取り込み、内容を画面で確認できます。

## 注意・今後の拡張

- 本アプリは **調剤監査・鑑査を代替するものではありません**。最終確認は薬剤師が行ってください。
- 現状はブラウザ内保存のため、端末間でデータは共有されません。
  複数端末で共有する場合は API/DB(例: Vercel Postgres 等)への保存に拡張します。
- 棚番マスタ連携、ピッキング実績の記録、音声/バーコード照合などを追加可能です。
