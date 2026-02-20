import Link from "next/link";
import prisma from "../app/lib/prisma";
import ComboCard from "./components/ComboCard";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ tags?: string }>;
}) {
  const resolvedParams = await searchParams;
  // URLからタグ文字列を取得 (例: "壁コン,カウンター")
  const tagsParam = resolvedParams?.tags;
  // カンマで区切って配列にする。空なら空配列。
  const selectedTags = tagsParam ? tagsParam.split(",") : [];

  // ----------------------------------------------------
  // 1. データベース検索ロジック (複数タグの絞り込み)
  // ----------------------------------------------------
  // 選んだタグが全て含まれている(AND)コンボだけを探す条件を作る
  const whereCondition =
    selectedTags.length > 0
      ? {
          AND: selectedTags.map((tag) => ({
            tags: { some: { name: tag } },
          })),
        }
      : undefined;

  const combos = await prisma.combo.findMany({
    where: whereCondition,
    include: { tags: true },
    orderBy: { createdAt: "desc" },
  });

  // ----------------------------------------------------
  // 2. 存在するタグ一覧の取得
  // ----------------------------------------------------
  // 紐づくコンボが1つもないタグは表示しない
  const allTags = await prisma.tag.findMany({
    where: {
      combos: {
        some: {},
      },
    },
  });

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 pb-20 text-zinc-100">
      {/* ヘッダーエリア */}
      <div className="flex justify-between items-center mb-8 mt-2">
        <h1 className="text-2xl font-black tracking-tighter bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent italic">
          COMBO RECORDER
        </h1>
      </div>

      {/* 作成ボタン */}
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

      {/* タグ検索エリア（複数選択対応） */}
      <div className="mb-8">
        <div className="flex justify-between items-end mb-3">
          <div className="flex items-center gap-2 text-xs text-zinc-500 font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-pink-500"></span>
            Multi-Filter
          </div>
          
          {/* 条件クリアボタン（選択中のタグがある時だけ表示） */}
          {selectedTags.length > 0 && (
            <Link href="/" className="text-[10px] text-zinc-500 border border-zinc-700 px-2 py-1 rounded hover:bg-zinc-800 transition">
              RESET ×
            </Link>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {/* DBにあるタグをボタンとして一覧表示 */}
          {allTags.map((tag) => {
            const isSelected = selectedTags.includes(tag.name);
            
            // --- 次のリンク先を作るロジック ---
            let newTags: string[] = [];
            if (isSelected) {
              // 既に選ばれていたら、除外する
              newTags = selectedTags.filter((t) => t !== tag.name);
            } else {
              // 選ばれていなければ、追加する
              newTags = [...selectedTags, tag.name];
            }
            
            // 空配列ならルートへ、中身があればカンマ区切りでURLへ
            const href = newTags.length > 0 ? `/?tags=${newTags.join(",")}` : "/";

            return (
              <Link
                key={tag.id}
                href={href}
                className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all select-none
               ${
                 isSelected
                   ? "bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/50 shadow-[0_0_10px_rgba(217,70,239,0.3)]"
                   : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-600"
               }`}
              >
                #{tag.name}
              </Link>
            );
          })}
        </div>
        
{/* 現在の検索条件の削除チップ */}
        {selectedTags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2 items-center bg-zinc-900/30 p-2 rounded border border-zinc-800">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Active:</span>
            
            {selectedTags.map((tag) => {
              // ここで「自分以外のタグだけを残したURL」を作る
              const newTags = selectedTags.filter((t) => t !== tag);
              const href = newTags.length > 0 ? `/?tags=${newTags.join(",")}` : "/";
              
              return (
                <Link
                  key={tag}
                  href={href}
                  className="flex items-center gap-1 bg-fuchsia-950/40 text-fuchsia-300 border border-fuchsia-800/50 text-[10px] px-2 py-0.5 rounded font-bold hover:bg-red-950/40 hover:text-red-300 hover:border-red-800/50 transition-colors group cursor-pointer"
                >
                  #{tag}
                  <span className="opacity-50 group-hover:opacity-100 font-normal ml-0.5">×</span>
                </Link>
              );
            })}
            
            {/* 一括削除リンク */}
            <Link href="/" className="ml-auto text-[10px] text-zinc-600 hover:text-zinc-300 transition-colors underline decoration-zinc-700 hover:decoration-zinc-500">
              Clear All
            </Link>
          </div>
        )}      </div>

      {/* リスト表示 */}
      <div className="space-y-4">
        {combos.length === 0 ? (
          <div className="text-zinc-600 text-center py-12 border-2 border-dashed border-zinc-800 rounded-2xl flex flex-col items-center gap-2">
            <span>NO COMBOS FOUND</span>
            <span className="text-xs font-normal opacity-50">Try changing or resetting filters</span>
          </div>
        ) : (
          combos.map((combo) => <ComboCard key={combo.id} combo={combo} />)
        )}
      </div>
    </div>
  );
}