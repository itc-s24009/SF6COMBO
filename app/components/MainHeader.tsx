"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MainHeader() {
  const pathname = usePathname();

  // 現在のページがコンボかチップスかを判定
  const isCombos = pathname === "/";
  const isTips = pathname === "/tips";

  return (
    <div className="flex items-center gap-6 mb-8 mt-4">
      {/* COMBO RECORDER タイトル */}
      <Link href="/">
        <h1
          className={`text-xl sm:text-2xl font-black tracking-tighter italic transition-all duration-300 ${
            isCombos
              ? "bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent opacity-100 scale-100"
              : "text-zinc-600 hover:text-zinc-400 opacity-70 scale-95"
          }`}
        >
          COMBO RECORDER
        </h1>
      </Link>

      {/* 区切り線（お好みで） */}
      <div className="h-6 w-[1px] bg-zinc-800 rotate-12"></div>

      {/* STRATEGY TIPS タイトル */}
      <Link href="/tips">
        <h1
          className={`text-xl sm:text-2xl font-black tracking-tighter italic transition-all duration-300 ${
            isTips
              ? "bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent opacity-100 scale-100"
              : "text-zinc-600 hover:text-zinc-400 opacity-70 scale-95"
          }`}
        >
          STRATEGY TIPS
        </h1>
      </Link>
    </div>
  );
}