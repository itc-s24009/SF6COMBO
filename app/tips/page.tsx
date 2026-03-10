import Link from "next/link";
import prisma from "../lib/prisma";
import MainHeader from "../components/MainHeader";
import TipCard from "../components/TipCard"; // ★ 先ほど作ったカード部品をインポート

export default async function TipsPage({ searchParams }: { searchParams: Promise<{ char?: string }> }) {
  const { char } = await searchParams;

  const tips = await prisma.strategyTip.findMany({
    where: char ? { characters: { some: { name: char } } } : undefined,
    include: { characters: true },
    orderBy: { createdAt: "desc" },
  });

  const allChars = await prisma.character.findMany();

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 pb-20 text-zinc-100">
      <MainHeader />

      <Link href="/tips/create" className="group relative w-full block text-center py-4 rounded-xl mb-10 overflow-hidden font-bold tracking-widest text-white shadow-lg shadow-cyan-900/40 hover:shadow-cyan-700/60 transition-all active:scale-[0.98]">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600 opacity-90"></div>
        <span className="relative">＋ NEW STRATEGY NOTE</span>
      </Link>

      {/* キャラ検索 */}
      <div className="mb-8 flex flex-wrap gap-2">
        <Link href="/tips" className={`px-4 py-1.5 rounded-full text-[10px] font-bold border transition-all ${!char ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500' : 'bg-zinc-900 text-zinc-500 border-zinc-800'}`}>ALL</Link>
        {allChars.map((c) => (
          <Link key={c.id} href={`/tips?char=${c.name}`} className={`px-4 py-1.5 rounded-full text-[10px] font-bold border transition-all ${char === c.name ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500' : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700'}`}>
            #{c.name}
          </Link>
        ))}
      </div>

      {/* 2カラム表示（TipCardコンポーネントを呼び出すだけ） */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {tips.map((tip) => (
          <TipCard key={tip.id} tip={tip} />
        ))}
        
        {tips.length === 0 && (
          <div className="col-span-2 text-zinc-600 text-center py-12 border-2 border-dashed border-zinc-800 rounded-2xl flex flex-col items-center gap-2">
            <span className="font-bold tracking-widest">NO STRATEGY NOTES FOUND</span>
          </div>
        )}
      </div>
    </div>
  );
}