"use client";
import { useState } from "react";
import { deleteCombo } from "../action";
import Link from "next/link";

type ComboProps = {
  id: string; moves: string; endFrame: number | null;
  damage: number | null; remarks: string | null;
  tags: { name: string }[];
}

export default function ComboCard({ combo }: { combo: ComboProps }) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // 親へのクリック干渉を完全に防ぐ魔法の関数
  const handleMenuClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuOpen(!menuOpen);
  };

  return (
    // relative は維持するが、z-index はメニュー開閉時のみ親ごと浮かせる
    <div 
      className={`relative group rounded-2xl p-5 border transition-all duration-300 cursor-pointer 
        ${isOpen ? 'bg-zinc-900 border-fuchsia-900/50 shadow-[0_0_20px_rgba(162,28,175,0.15)]' : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800'}
        ${menuOpen ? 'z-50' : 'z-0'} 
      `}
      onClick={() => {
        // メニューが開いている時は、カードの開閉より先にメニューを閉じることを優先
        if (menuOpen) setMenuOpen(false);
        else setIsOpen(!isOpen);
      }}
    >
      {isOpen && <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-500/5 blur-[60px] rounded-full pointer-events-none -z-10"></div>}

      <div className="flex justify-between items-start mb-3 relative z-10">
        <div className="text-lg md:text-xl font-bold text-zinc-100 pr-10 leading-snug">
          {combo.moves.split(' > ').map((move, i, arr) => (
             <span key={i}>
               {move}
               {i < arr.length - 1 && <span className="text-zinc-600 mx-1.5 text-sm">▶</span>}
             </span>
          ))}
        </div>

        {/* --- ︙メニューと当たり判定 --- */}
        {/* 当たり判定を少し広く取って、誤爆を防ぐ */}
        <div className="absolute right-[-8px] top-[-8px]">
          <button 
            type="button"
            onClick={handleMenuClick}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition z-20 relative"
          >
            ︙
          </button>
          
          {menuOpen && (
            // fixed に近い感覚で絶対に裏に回らないように z-[9999]
            <div 
               className="absolute right-0 top-10 bg-zinc-950 border border-zinc-700 shadow-[0_0_30px_rgba(0,0,0,0.8)] rounded-lg z-[9999] w-32 overflow-hidden flex flex-col"
               onClick={(e) => e.stopPropagation()} 
            >
              {/* EDITは通常リンク。ここでしっかり反応するようになります */}
              <Link 
                href={`/edit/${combo.id}`}
                className="w-full text-left px-4 py-3 text-xs font-bold text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors block"
              >
                EDIT
              </Link>
              <form action={deleteCombo} className="m-0 p-0 block">
                <input type="hidden" name="id" value={combo.id} />
                <button 
                  type="submit" 
                  className="w-full text-left px-4 py-3 text-xs font-bold text-red-400 hover:bg-red-900/40 hover:text-red-300 transition-colors border-t border-zinc-800"
                >
                  DELETE
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-2 relative z-10">
        {combo.tags.map(tag => (
           <span key={tag.name} className="text-[10px] uppercase font-bold tracking-wider bg-zinc-800 border border-zinc-700 text-zinc-400 px-2 py-1 rounded pointer-events-none">
             #{tag.name}
           </span>
        ))}
      </div>

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