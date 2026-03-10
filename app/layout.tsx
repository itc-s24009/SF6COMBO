import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "A.K.I. Combo Recorder",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="bg-zinc-950 text-zinc-100 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}