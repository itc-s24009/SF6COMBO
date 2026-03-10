"use client";
import { useState } from "react";
import { updateCombo } from "../../action";
import Link from "next/link";

// --- ドラッグ&ドロップ用インポート ---
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// --- 型定義 ---
type SelectedMove = {
  id: string; 
  name: string;
};

const MOVE_GROUPS = [
  { category: "始動", moves: ["パニカン", "カウンター"] },
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

type Props = {
  combo: { id: string; moves: string; endFrame: number | null; damage: number | null; remarks: string | null; tags: { name: string }[]; };
  allTags: { id: string; name: string }[];
}

// --- 並び替え可能なパーツ（削除ボタン付き） ---
function SortableMove({ move, index, total, onRemove }: { move: SelectedMove; index: number; total: number; onRemove: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: move.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : "auto",
  };

  return (
    <div ref={setNodeRef} style={style} className={`relative flex items-center group ${isDragging ? "opacity-50" : ""}`}>
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing flex items-center bg-zinc-800 border border-zinc-700 text-zinc-100 pl-3 pr-2 py-1.5 rounded text-xs font-bold hover:border-zinc-500 transition-all shadow-md"
      >
        <span className="mr-2 uppercase tracking-tight">{move.name}</span>
        {/* バツボタン：ここだけ削除を許可 */}
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()} 
          onClick={() => onRemove(move.id)}
          className="w-4 h-4 flex items-center justify-center bg-zinc-700 hover:bg-red-600 rounded-sm text-[10px] text-zinc-400 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>
      {index < total - 1 && <span className="text-zinc-600 mx-1.5 text-xs italic font-bold">▶</span>}
    </div>
  );
}

export default function EditForm({ combo, allTags }: Props) {
  // ★ポイント: 既存の文字列 "弱P > 中P" をユニークなID付き配列に変換して初期化
  const [selectedMoves, setSelectedMoves] = useState<SelectedMove[]>(() => 
    combo.moves.split(" > ").map(m => ({ id: crypto.randomUUID(), name: m }))
  );
  
  const [tagInput, setTagInput] = useState<string>("");
  const [tags, setTags] = useState<string[]>(combo.tags.map(t => t.name));

  // DND用センサー設定
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const addMove = (moveName: string) => {
    setSelectedMoves([...selectedMoves, { id: crypto.randomUUID(), name: moveName }]);
  };

  const removeMove = (id: string) => {
    setSelectedMoves(selectedMoves.filter((m) => m.id !== id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setSelectedMoves((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
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
    if (!tags.includes(tagName)) setTags([...tags, tagName]);
  }

  const availableTags = allTags.filter((t) => !tags.includes(t.name));

  return (
    <div className="max-w-4xl mx-auto pb-20 text-zinc-100 min-h-screen">
      {/* 編集モニター（スティッキー） */}
      <div className="sticky top-0 z-50 bg-zinc-950/95 backdrop-blur-md border-b border-cyan-900/40 shadow-xl">
        <div className="p-3 max-w-4xl mx-auto flex flex-col gap-2">
          <div className="flex justify-between items-center text-[10px] font-bold tracking-[0.2em]">
            <span className="text-cyan-500 uppercase">Edit Record Mode</span>
            <Link href="/" className="text-zinc-500 hover:text-white transition uppercase">Discard Changes</Link>
          </div>
          
          <div className="min-h-[54px] flex flex-wrap gap-y-3 gap-x-1 items-center">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={selectedMoves.map(m => m.id)} strategy={horizontalListSortingStrategy}>
                {selectedMoves.map((move, index) => (
                  <SortableMove 
                    key={move.id} 
                    move={move} 
                    index={index} 
                    total={selectedMoves.length} 
                    onRemove={removeMove} 
                  />
                ))}
              </SortableContext>
            </DndContext>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-6">
        {/* 技選択パネル（デザイン統一） */}
        <div className="space-y-4">
          {MOVE_GROUPS.map((group) => (
            <div key={group.category}>
              <h3 className="text-[10px] font-bold text-zinc-600 uppercase mb-1.5 flex items-center gap-2 tracking-tighter">
                <span className="w-1 h-1 bg-cyan-600 rounded-full"></span>{group.category}
              </h3>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-1.5">
                {group.moves.map((move) => {
                  const isSpecial = move.includes("SA") || move.includes("OD");
                  const isSystem = ["DR", "CDR", "パリィスカ", "前ステ", "バクステ"].includes(move);
                  const isPunish = move === "パニカン";
                  const isCounter = move === "カウンター";
                  const isImpact = move === "インパクト";

                  let buttonStyle = "bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-600";
                  if (isPunish) buttonStyle = "bg-orange-950/40 border-orange-700 text-orange-400 hover:bg-orange-800 hover:border-orange-500 shadow-[0_0_10px_rgba(251,146,60,0.1)]";
                  else if (isCounter) buttonStyle = "bg-yellow-950/30 border-yellow-800 text-yellow-300 hover:bg-yellow-800 hover:border-yellow-600 shadow-[0_0_10px_rgba(253,224,71,0.05)]";
                  else if (isImpact) buttonStyle = "bg-red-950/40 border-red-700 text-red-400 hover:bg-red-800 hover:border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.1)]";
                  else if (isSpecial) buttonStyle = "bg-fuchsia-950/40 border-fuchsia-900 text-fuchsia-200 hover:bg-fuchsia-900/60 shadow-[0_0_10px_rgba(162,28,175,0.1)]";
                  else if (isSystem) buttonStyle = "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800";

                  return (
                    <button type="button" key={move} onClick={() => addMove(move)} className={`py-2 px-1 text-[10px] sm:text-[11px] font-bold rounded border active:scale-95 transition-all duration-200 ${buttonStyle}`}>
                      {move}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* フォーム入力 */}
        <form action={updateCombo} className="space-y-6 pt-6 border-t border-zinc-800/50">
          <input type="hidden" name="id" value={combo.id} />
          {/* オブジェクト配列を文字列に変換して送信 */}
          <input type="hidden" name="moves" value={selectedMoves.map(m => m.name).join(" > ")} />
          <input type="hidden" name="tags" value={tags.join(",")} />

          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block text-[10px] font-bold text-zinc-500 mb-1.5 uppercase tracking-widest">Advantage (F)</label>
              <input type="number" name="endFrame" defaultValue={combo.endFrame ?? ""} className="bg-zinc-900 border border-zinc-800 text-white p-3 rounded-lg w-full focus:outline-none focus:border-cyan-600 transition [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none" placeholder="Frame" />
            </div>
            <div className="w-1/2">
              <label className="block text-[10px] font-bold text-zinc-500 mb-1.5 uppercase tracking-widest">Damage</label>
              <input type="number" name="damage" defaultValue={combo.damage ?? ""} className="bg-zinc-900 border border-zinc-800 text-white p-3 rounded-lg w-full focus:outline-none focus:border-cyan-600 transition [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none" placeholder="Damage" />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-zinc-500 mb-1.5 uppercase tracking-widest">Category Tags</label>
            <div className="flex flex-wrap gap-2 mb-2 min-h-[24px]">
              {tags.map((tag) => (
                <span key={tag} onClick={() => setTags(tags.filter(t => t !== tag))} className="bg-cyan-900/20 border border-cyan-800/50 text-cyan-300 px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer hover:bg-red-900/30 hover:text-red-300 transition-colors flex items-center gap-1 group shadow-sm">
                  #{tag} <span className="opacity-50 group-hover:opacity-100 italic">×</span>
                </span>
              ))}
            </div>
            <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={addTag} className="bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm p-3 rounded-lg w-full focus:outline-none focus:border-cyan-600 transition mb-3 shadow-inner" placeholder="Update or Add new tags (Enter)" />
            
            {/* 候補タグ */}
            {availableTags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1 p-2 bg-zinc-950/40 rounded border border-zinc-800/40">
                <span className="w-full text-[9px] text-zinc-600 font-black mb-1.5 uppercase tracking-tighter italic">Recommended:</span>
                {availableTags.map(tag => (
                  <button type="button" key={tag.id} onClick={() => addExistingTag(tag.name)} className="bg-zinc-900/50 border border-zinc-800 text-zinc-500 hover:text-cyan-400 hover:border-cyan-900/50 px-2 py-0.5 rounded text-[9px] font-bold transition-all uppercase tracking-tighter">
                    + {tag.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
             <label className="block text-[10px] font-bold text-zinc-500 mb-1.5 uppercase tracking-widest">Strategic Memo</label>
             <textarea name="remarks" defaultValue={combo.remarks ?? ""} rows={4} className="bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm p-3 rounded-lg w-full focus:outline-none focus:border-cyan-600 transition shadow-inner leading-relaxed" placeholder="Situation notes..."></textarea>
          </div>

          <button type="submit" className="group relative w-full overflow-hidden bg-cyan-600 text-white font-black text-lg p-4 rounded-xl shadow-[0_0_20px_rgba(8,145,178,0.2)] hover:shadow-[0_0_30px_rgba(8,145,178,0.4)] transition-all active:scale-[0.98] uppercase tracking-widest italic">
            <span className="relative z-10 flex items-center justify-center gap-2">
              Apply Changes ⚡
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 via-emerald-600 to-cyan-600 group-hover:opacity-90"></div>
          </button>
        </form>
      </div>
    </div>
  );
}