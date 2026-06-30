import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "薬局ピッキング",
  description: "自社薬局向け スマホ/iPad ピッキング支援システム",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ピッキング",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0f766e",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <div className="mx-auto min-h-screen max-w-3xl bg-slate-50 shadow-sm">
          {children}
        </div>
      </body>
    </html>
  );
}
