"use client";
import { useState } from "react";
import Link from "next/link";
import { deleteTip } from "../action";
import { useRouter } from "next/navigation";

type TipProps = {
  id: string;
  title: string;
  content: string;
  characters: { id: string; name: string }[];
};

export default function TipCard({ tip }: { tip: TipProps }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  // カード全体がクリックされたときの処理
  const handleCardClick = () => {
    setIsModalOpen(true);
  };

  // タグがクリックされたときの処理
  const handleTagClick = (e: React.MouseEvent, charName: string) => {
    // ★ 親（カード全体）の handleCardClick が発動するのを防ぐ最強の魔法
    e.preventDefault();
    e.stopPropagation(); 
    
    // そのキャラの絞り込みページへジャンプ
    router.push(`/tips?char=${charName}`);
  };

  return (
    <>
      {/* 1. 一覧表示用の正方形カード */}
      {/* onClick を追加し、カードのどこをクリックしてもポップアップが開くようにする */}
      <div 
        onClick={handleCardClick}
        className="aspect-square bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-5 flex flex-col shadow-lg hover:border-cyan-500 transition-all relative group overflow-hidden hover:shadow-[0_0_15px_rgba(8,145,178,0.2)] cursor-pointer"
      >
        
        {/* ヘッダー部分（タイトルとキャラタグ） */}
        <div className="shrink-0 mb-3">
          <div className="flex justify-between items-start mb-2 sm:mb-3 pointer-events-none">
            <h3 className="font-bold text-base sm:text-lg text-zinc-100 leading-tight tracking-wide group-hover:text-cyan-400 transition-colors">
              {tip.title}
            </h3>
            <span className="text-zinc-600 group-hover:text-cyan-400 transition-colors text-xs font-bold pl-2">
              ⤢
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {tip.characters.map(c => (
              <button 
                key={c.id} 
                onClick={(e) => handleTagClick(e, c.name)}
                className="text-[10px] sm:text-xs text-cyan-400 font-bold px-2 py-0.5 border border-cyan-900/50 bg-cyan-950/40 rounded shadow-sm hover:bg-cyan-900 hover:text-white transition-colors cursor-pointer relative z-10"
              >
                #{c.name}
              </button>
            ))}
          </div>
        </div>

        {/* 本文エリア（スクロール可能） */}
        {/* onClick時の伝播停止は不要になりました。親の handleCardClick が発動してくれます */}
        <div 
          className="text-xs sm:text-sm text-zinc-400 leading-relaxed flex-1 whitespace-pre-wrap font-medium overflow-y-auto pr-2 custom-scrollbar relative z-0"
        >
          {tip.content}
        </div>
      </div>

      {/* 2. ポップアップ（モーダル）表示：変更なし */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* モーダルヘッダー */}
            <div className="p-5 sm:p-6 border-b border-zinc-800 flex justify-between items-start bg-zinc-950/50">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white mb-3 tracking-wide leading-snug">
                  {tip.title}
                </h2>
                <div className="flex flex-wrap gap-1.5">
                  {tip.characters.map(c => (
                    <span key={c.id} className="text-xs text-cyan-400 font-bold px-2 py-1 border border-cyan-900/50 bg-cyan-950/40 rounded shadow-sm">
                      #{c.name}
                    </span>
                  ))}
                </div>
              </div>
              
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors ml-4 shrink-0"
              >
                ✕
              </button>
            </div>

            {/* モーダル本文 */}
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 text-sm sm:text-base text-zinc-300 whitespace-pre-wrap leading-loose">
              {tip.content}
            </div>

            {/* モーダルフッター */}
            <div className="p-4 border-t border-zinc-800 bg-zinc-950/50 flex justify-end gap-3 items-center">
              <Link 
                href={`/tips/edit/${tip.id}`} 
                className="px-4 py-2 text-xs font-bold text-cyan-400 border border-cyan-900/50 bg-cyan-950/30 rounded hover:bg-cyan-900/50 transition-colors uppercase tracking-widest"
              >
                Edit Note
              </Link>
              <form action={deleteTip}>
                <input type="hidden" name="id" value={tip.id} />
                <button 
                  type="submit" 
                  className="px-4 py-2 text-xs font-bold text-red-400 border border-red-900/50 bg-red-950/30 rounded hover:bg-red-900/50 transition-colors uppercase tracking-widest"
                >
                  Delete
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}