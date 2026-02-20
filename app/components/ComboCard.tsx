"use client";
import { useState } from "react";
import { deleteCombo } from "../action";
import Link from "next/link";

type ComboProps = {
  id: string; 
  moves: string; 
  endFrame: number | null;
  damage: number | null; 
  remarks: string | null;
  tags: { name: string }[];
}

export default function ComboCard({ combo }: { combo: ComboProps }) {
  const [isOpen, setIsOpen] = useState(false);

  // 子供（EDIT・DELETE）をクリックした時に、親の開閉(onClick)が反応しないようにする魔法
  const stopClick = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div 
      // 全体のクリック判定で詳細（ダメージ等）を開閉する
      className={`relative group rounded-2xl p-5 border transition-all duration-300 cursor-pointer overflow-hidden
        ${isOpen 
          ? 'bg-zinc-900 border-fuchsia-900/50 shadow-[0_0_20px_rgba(162,28,175,0.15)]' 
          : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800'}`}
      onClick={() => setIsOpen(!isOpen)}
    >
      {/* 展開時のサイバーな後光 */}
      {isOpen && <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-500/5 blur-[60px] rounded-full pointer-events-none -z-10"></div>}

      <div className="flex flex-col gap-3 relative z-10">
        
        {/* コンボ技名の列 */}
        <div className="text-lg md:text-xl font-bold text-zinc-100 leading-snug break-words">
          {combo.moves.split(' > ').map((move, i, arr) => (
             <span key={i}>
               {move}
               {i < arr.length - 1 && <span className="text-zinc-600 mx-1.5 text-sm inline-block translate-y-[-1px]">▶</span>}
             </span>
          ))}
        </div>

        {/* 下段：左側にタグ、右側に操作ボタン */}
        <div className="flex justify-between items-end mt-1">
          {/* 左：タグリスト */}
          <div className="flex flex-wrap gap-2 pr-4">
            {combo.tags.length === 0 && <div className="h-6"></div> /* タグゼロでも高さをキープ */}
            {combo.tags.map(tag => (
              <span key={tag.name} className="text-[10px] uppercase font-bold tracking-wider bg-zinc-800 border border-zinc-700 text-zinc-400 px-2 py-1 rounded">
                #{tag.name}
              </span>
            ))}
          </div>

          {/* 右：直押しできる操作パネル */}
          {/* ※ 親要素の「詳細を開くクリック」から逃れるために onClick={stopClick} を使用 */}
          <div className="flex gap-2" onClick={stopClick}>
            <Link 
              href={`/edit/${combo.id}`}
              className="px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-widest bg-zinc-800/80 border border-zinc-700 text-cyan-500 hover:bg-cyan-900/30 hover:border-cyan-800 transition"
            >
              EDIT
            </Link>

            <form action={deleteCombo}>
              <input type="hidden" name="id" value={combo.id} />
              <button 
                type="submit" 
                className="px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-widest bg-zinc-800/80 border border-zinc-700 text-red-500 hover:bg-red-900/30 hover:border-red-800 transition"
                // ※ ここでうっかりEnterを押さないよう警告を入れることも可能(後述)
              >
                DEL
              </button>
            </form>
          </div>
        </div>

      </div>

      {/* 開閉式のアコーディオン（ダメージやFなどの詳細） */}
      <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${isOpen ? 'grid-rows-[1fr] mt-4 pt-4 border-t border-zinc-800' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
           <div className="flex gap-8 mb-4">
             <div className="flex flex-col">
               <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">DAMAGE</span>
               <span className="text-2xl font-mono font-bold text-white">{combo.damage ? combo.damage.toLocaleString() : "---"}</span>
             </div>
             <div className="flex flex-col">
               <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">ADVANTAGE</span>
               <span className={`text-2xl font-mono font-bold ${combo.endFrame && combo.endFrame > 0 ? 'text-blue-400' : 'text-zinc-300'}`}>
                 {combo.endFrame ? (combo.endFrame > 0 ? `+${combo.endFrame}` : combo.endFrame) : "---"}
                 <span className="text-xs text-zinc-500 ml-1">F</span>
               </span>
             </div>
           </div>
           
           {combo.remarks && (
             <div>
               <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest block mb-2">NOTE</span>
               <div className="whitespace-pre-wrap text-sm text-zinc-400 leading-relaxed bg-zinc-950/50 p-3 rounded-lg border border-zinc-800/50">
                 {combo.remarks}
               </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}