"use client";
import { useState } from "react";
import { createCombo } from "../action";
import Link from "next/link";

const MOVE_GROUPS = [
  { category: "立ち", moves: ["弱P", "中P", "強P", "弱K", "中K", "強K"] },
  { category: "屈", moves: ["屈弱P", "屈中P", "屈強P", "屈弱K", "屈中K", "屈強K"] },
  { category: "空中", moves: ["飛弱P", "飛中P", "飛強P", "飛弱K", "飛中K", "飛強K"] },
  { category: "特殊", moves: ["前強K", "前強P", "中段", "めくり強P"] },
  { category: "鞭", moves: ["弱鞭", "中鞭", "強鞭", "OD鞭"] },
  { category: "泡", moves: ["弾", "OD弾", "毒設置", "紫泡撒"] },
  { category: "凶襲突", moves: ["弱凶襲突", "中凶襲突", "強凶襲突", "OD凶襲突"] },
  { category: "蛇軽功", moves: ["弱蛇軽功", "中蛇軽功", "強蛇軽功", "OD蛇軽功"] },
  { category: "伏せ・投げ", moves: [ "悪鬼蛇行", "猛毒牙", "蛇連咬", "コマ投げ"] },
  { category: "SA", moves: ["SA1", "SA2", "SA3"] },
  { category: "システム・移動", moves: ["前ステ", "バクステ", "DR", "CDR", "垂直", "前ジャンプ", "後ろジャンプ", "前投げ", "後ろ投げ", "インパクト", "パリィスカ"] }
];

export default function ClientCreateForm({ allTags }: { allTags: { id: string; name: string }[] }) {
  const [selectedMoves, setSelectedMoves] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);

  const addMove = (move: string) => setSelectedMoves([...selectedMoves, move]);
  const removeMove = (indexToRemove: number) => {
    setSelectedMoves(selectedMoves.filter((_, index) => index !== indexToRemove));
  };
  
  const addTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault(); 
      if (tagInput.trim() !== "" && !tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]); 
        setTagInput("");
      }
    }
  }

  const addExistingTag = (tagName: string) => {
    if (!tags.includes(tagName)) {
      setTags([...tags, tagName]);
    }
  }

  // 現存するタグの中で、まだ「今のコンボ」で選んでいないものだけを下に出す
  const availableTags = allTags.filter((t) => !tags.includes(t.name));

  return (
    <div className="max-w-4xl mx-auto pb-20 text-zinc-100 min-h-screen">
      
      {/* 入力モニター（常に一番上に張り付きます） */}
      <div className="sticky top-0 z-50 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800 shadow-xl">
        <div className="p-3 max-w-4xl mx-auto flex flex-col gap-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold tracking-widest text-zinc-500">NEW RECORD</span>
            <Link href="/" className="font-bold text-zinc-500 hover:text-white transition">CANCEL</Link>
          </div>
          
          <div className="min-h-[50px] flex flex-wrap gap-2 items-center relative">
            {selectedMoves.length === 0 && <span className="text-zinc-700 text-xs font-mono">INPUT COMMANDS...</span>}
            {selectedMoves.map((move, index) => (
              <button key={index} onClick={() => removeMove(index)} className="group relative bg-zinc-800 border border-zinc-700 text-zinc-100 px-2 py-1 rounded text-xs font-bold hover:bg-red-900/50 hover:border-red-500 hover:text-red-200 transition-all">
                {move}
                {index < selectedMoves.length - 1 && <span className="absolute -right-2 top-1 text-zinc-600 pointer-events-none scale-75">▶</span>}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-6">
        
        {/* 技パネル */}
        <div className="space-y-4">
          {MOVE_GROUPS.map((group) => (
            <div key={group.category}>
              <h3 className="text-[10px] font-bold text-zinc-600 uppercase mb-1 flex items-center gap-2">
                <span className="w-1 h-1 bg-purple-500 rounded-full"></span>{group.category}
              </h3>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-1.5">
                {group.moves.map((move) => {
                  const isSpecial = move.includes("SA") || move.includes("OD");
                  const isSystem = ["DR", "CDR", "インパクト", "パリィスカ", "前ステ", "バクステ"].includes(move);
                  const isJump = group.category === "空中";
                  return (
                    <button type="button" key={move} onClick={() => addMove(move)} className={`py-2 px-1 text-[11px] font-bold rounded border active:scale-95 transition-colors ${isSpecial ? 'bg-fuchsia-950/40 border-fuchsia-900 text-fuchsia-200 hover:bg-fuchsia-900/60' : isSystem ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800' : isJump ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800' : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-600'}`}>{move}</button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* 登録フォーム */}
        <form action={createCombo} className="space-y-6 pt-4 border-t border-zinc-800">
          <input type="hidden" name="moves" value={selectedMoves.join(" > ")} />
          <input type="hidden" name="tags" value={tags.join(",")} />

          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block text-[10px] font-bold text-zinc-500 mb-1 uppercase tracking-widest">Advantage</label>
              <input type="number" name="endFrame" placeholder="+4" className="bg-zinc-900 border border-zinc-800 text-white p-3 rounded-lg w-full focus:outline-none focus:border-purple-500 transition [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none" />
            </div>
            <div className="w-1/2">
              <label className="block text-[10px] font-bold text-zinc-500 mb-1 uppercase tracking-widest">Damage</label>
              <input type="number" name="damage" placeholder="2500" className="bg-zinc-900 border border-zinc-800 text-white p-3 rounded-lg w-full focus:outline-none focus:border-purple-500 transition [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none" />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-zinc-500 mb-1 uppercase tracking-widest">Tags</label>
            
            {/* 選択したタグ */}
            <div className="flex flex-wrap gap-2 mb-2 min-h-[24px]">
              {tags.map((tag) => (
                <span key={tag} onClick={() => setTags(tags.filter(t => t !== tag))} className="bg-violet-900/30 border border-violet-800 text-violet-300 px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer hover:bg-red-900/30 hover:text-red-300 transition-colors flex items-center gap-1 group">
                  #{tag} <span className="opacity-50 group-hover:opacity-100">×</span>
                </span>
              ))}
            </div>

            {/* 新規タグ入力 */}
            <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={addTag} className="bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm p-3 rounded-lg w-full focus:outline-none focus:border-purple-500 transition mb-2" placeholder="新しいタグを入力してEnter" />
            
            {/* ★既存のタグから選択★ */}
            {availableTags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1 p-2 bg-zinc-950/50 rounded border border-zinc-800/50">
                <span className="w-full text-[10px] text-zinc-600 font-bold mb-1 uppercase tracking-widest block">Existing Tags:</span>
                {availableTags.map(tag => (
                  <button type="button" key={tag.id} onClick={() => addExistingTag(tag.name)} className="bg-zinc-900 border border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800 px-2 py-1 rounded text-[10px] font-bold transition">
                    + {tag.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-[10px] font-bold text-zinc-500 mb-1 uppercase tracking-widest">Memo</label>
            <textarea name="remarks" rows={3} className="bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm p-3 rounded-lg w-full focus:outline-none focus:border-purple-500 transition"></textarea>
          </div>

          <button type="submit" disabled={selectedMoves.length === 0} className="w-full bg-gradient-to-r from-violet-700 to-fuchsia-700 hover:from-violet-600 hover:to-fuchsia-600 text-white font-black text-lg p-4 rounded-xl shadow-lg transition active:scale-[0.99] disabled:opacity-30">
            SAVE RECORD
          </button>
        </form>
      </div>
    </div>
  );
}