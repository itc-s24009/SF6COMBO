import Link from "next/link";
import prisma from "../app/lib/prisma";
import ComboCard from "./components/ComboCard";

export default async function Home({ searchParams }: { searchParams: { tag?: string } }) {
  const resolvedParams = await searchParams;
  const currentTag = resolvedParams?.tag;

  const combos = await prisma.combo.findMany({
    where: currentTag ? { tags: { some: { name: currentTag } } } : undefined,
    include: { tags: true },
    orderBy: { createdAt: 'desc' }
  });
  
const allTags = await prisma.tag.findMany({
  where: {
    combos: {
      some: {} // 関連する「combos」が「some(いくつかある＝1個以上ある)」場合のみ取得
    }
  }
});
  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 pb-20">
      {/* ヘッダーエリア */}
      <div className="flex justify-between items-center mb-8 mt-2">
        <h1 className="text-2xl font-black tracking-tighter bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent italic">
          COMBO RECORDER
        </h1>
      </div>

      {/* 作成ボタン（グラデーションの目立つボタン） */}
      <Link 
        href="/create" 
        className="group relative w-full block text-center py-4 rounded-xl mb-10 overflow-hidden font-bold tracking-widest text-white shadow-lg shadow-purple-900/40 hover:shadow-purple-700/60 transition-all active:scale-[0.98]"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 animate-gradient-x opacity-90 group-hover:opacity-100"></div>
        <span className="relative flex items-center justify-center gap-2">
           <span>NEW RECORD</span>
           <span className="text-xl">＋</span>
        </span>
      </Link>

      {/* タグ検索エリア */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3 text-xs text-zinc-500 font-bold uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-pink-500"></span>
          Filter by Tags
        </div>
        <div className="flex flex-wrap gap-2">
           <Link href="/" 
             className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all 
             ${!currentTag 
               ? 'bg-zinc-100 text-zinc-900 border-zinc-100 shadow-[0_0_10px_rgba(255,255,255,0.3)]' 
               : 'bg-transparent text-zinc-500 border-zinc-800 hover:border-zinc-600'}`}>
             ALL
           </Link>
           {allTags.map(tag => (
             <Link key={tag.id} href={`/?tag=${tag.name}`} 
               className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all 
               ${currentTag === tag.name 
                 ? 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/50 shadow-[0_0_10px_rgba(217,70,239,0.3)]' 
                 : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-600'}`}>
                #{tag.name}
             </Link>
           ))}
        </div>
      </div>

      {/* リスト表示 */}
      <div className="space-y-4">
        {combos.length === 0 ? (
          <div className="text-zinc-600 text-center py-12 border-2 border-dashed border-zinc-800 rounded-2xl">
            NO DATA RECORDED
          </div>
        ) : (
          combos.map((combo) => <ComboCard key={combo.id} combo={combo} />)
        )}
      </div>
    </div>
  );
}