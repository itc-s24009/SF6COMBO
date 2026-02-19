"use client";
import { useState } from "react";
import { createCombo } from "../action";
import Link from "next/link";

// 前述のA.K.I.の技リストそのまま
const AVAILABLE_MOVES = [
  "弱P", "中P", "強P", "弱K", "中K", "強K", 
  "飛弱P", "飛中P", "飛強P", "飛弱K", "飛中K", "飛強K",
  "屈弱P", "屈中P", "屈強P", "屈弱K", "屈中K", "屈強K",
  "前強K", "前強P", "中段", "めくり強P",
  "弱鞭", "中鞭", "強鞭", "OD鞭", "弾", "OD弾", "毒設置", "紫泡撒", 
  "弱凶襲突", "中凶襲突", "強凶襲突", "OD凶襲突",
  "弱蛇軽功", "中蛇軽功", "強蛇軽功", "OD蛇軽功",
  "悪鬼蛇行", "猛毒牙", "蛇連咬", "コマ投げ", "SA1", "SA2", "SA3"
];

export default function CreateComboPage() {
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

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 pb-20 text-zinc-100">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-xl font-bold tracking-wider italic text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
          INPUT SEQUENCE
        </h1>
        <Link href="/" className="text-xs font-bold text-zinc-500 hover:text-white transition">CANCEL</Link>
      </div>

      {/* 画面：入力モニター風エリア */}
      <div className="mb-6 p-6 min-h-24 bg-black border border-zinc-800 rounded-xl shadow-inner flex flex-wrap gap-2 items-center content-center relative overflow-hidden">
        {selectedMoves.length === 0 && <span className="text-zinc-700 text-xs font-mono absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">WAITING FOR INPUT...</span>}
        
        {selectedMoves.map((move, index) => (
          <div key={index} className="flex items-center group animate-in fade-in slide-in-from-left-2 duration-200">
            <button 
               type="button" 
               onClick={() => removeMove(index)} 
               className="relative bg-zinc-900 border border-zinc-700 text-zinc-200 px-3 py-1.5 rounded hover:bg-red-900/30 hover:border-red-500/50 hover:text-red-200 transition-all font-bold text-sm"
            >
              {move}
              {/* ホバー時に×が出る演出 */}
              <div className="absolute inset-0 flex items-center justify-center bg-red-900/80 text-white opacity-0 group-hover:opacity-100 rounded">×</div>
            </button>
            {index < selectedMoves.length - 1 && <span className="text-zinc-600 mx-2 text-xs">▶</span>}
          </div>
        ))}
      </div>

      {/* コマンドパネルエリア */}
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mb-10 pb-10 border-b border-zinc-800">
        {AVAILABLE_MOVES.map((move) => {
          // ボタンの色分け（必殺技やSAなどは少し目立たせる例）
          const isSpecial = move.includes("SA") || move.includes("OD");
          return (
            <button 
              type="button" 
              key={move} 
              onClick={() => addMove(move)} 
              className={`p-2.5 text-xs font-bold rounded border transition-all active:scale-95
              ${isSpecial 
                ? 'bg-fuchsia-950/40 border-fuchsia-900 text-fuchsia-200 hover:bg-fuchsia-900/60' 
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 hover:border-zinc-600'
              }`}
            >
              {move}
            </button>
          )
        })}
      </div>

      <form action={createCombo} className="space-y-8">
        <input type="hidden" name="moves" value={selectedMoves.join(" > ")} />
        <input type="hidden" name="tags" value={tags.join(",")} />

        {/* 数値入力系 */}
        <div className="flex gap-4">
          <div className="w-1/2">
            <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-widest">Advantage (F)</label>
            <input type="number" name="endFrame" placeholder="+4" 
              className="bg-zinc-900 border border-zinc-800 text-white text-lg p-3 rounded-lg w-full focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none" />
          </div>
          <div className="w-1/2">
            <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-widest">Damage</label>
            <input type="number" name="damage" placeholder="2500" 
              className="bg-zinc-900 border border-zinc-800 text-white text-lg p-3 rounded-lg w-full focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none" />
          </div>
        </div>

        {/* タグ入力 */}
        <div>
          <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-widest">Tags</label>
          <div className="flex flex-wrap gap-2 mb-3 min-h-6">
            {tags.map((tag) => (
              <span key={tag} onClick={() => setTags(tags.filter(t => t !== tag))} 
                className="bg-violet-900/30 border border-violet-800 text-violet-300 px-3 py-1 rounded-full text-xs font-bold cursor-pointer hover:bg-red-900/30 hover:text-red-300 transition-colors flex items-center gap-2 group">
                #{tag} <span className="opacity-50 group-hover:opacity-100">×</span>
              </span>
            ))}
          </div>
          <input 
            type="text" 
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={addTag}
            className="bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm p-3 rounded-lg w-full focus:outline-none focus:border-purple-500 transition" 
            placeholder="Add Tags (Enter to add)" 
          />
        </div>

        {/* 備考欄 */}
        <div>
          <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-widest">Memo</label>
          <textarea name="remarks" rows={4} className="bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm p-3 rounded-lg w-full focus:outline-none focus:border-purple-500 transition" placeholder="Tips..."></textarea>
        </div>

        {/* 保存ボタン */}
        <button type="submit" disabled={selectedMoves.length === 0} className="w-full bg-gradient-to-r from-violet-700 to-fuchsia-700 hover:from-violet-600 hover:to-fuchsia-600 text-white font-black text-lg p-4 rounded-xl shadow-lg shadow-purple-900/30 transition-all transform active:scale-[0.99] disabled:opacity-30 disabled:cursor-not-allowed">
          SAVE RECORD
        </button>
      </form>
    </div>
  );
}