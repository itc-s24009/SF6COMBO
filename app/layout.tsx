import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Combo Maker",
  description: "Fighting Game Combo Memo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      {/* 背景を濃い色に、文字を白っぽく設定 */}
      <body className="bg-zinc-950 text-zinc-100 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}