"use client";
import { useState } from "react";
import { createCombo } from "../action";
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
  id: string; // ユニークなID
  name: string; // 技名
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

// --- 並び替え可能な各技ボタンのコンポーネント ---
function SortableMove({ move, index, total, onRemove }: { move: SelectedMove; index: number; total: number; onRemove: (id: string) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: move.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : "auto",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative flex items-center group ${isDragging ? "opacity-50" : ""}`}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing flex items-center bg-zinc-800 border border-zinc-700 text-zinc-100 pl-3 pr-2 py-1.5 rounded text-xs font-bold hover:border-zinc-500 transition-all"
      >
        <span className="mr-2">{move.name}</span>
        {/* 削除ボタン：ここをクリックした時だけ削除 */}
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()} // ドラッグ開始を防ぐ
          onClick={() => onRemove(move.id)}
          className="w-4 h-4 flex items-center justify-center bg-zinc-700 hover:bg-red-600 rounded-sm text-[10px] text-zinc-300 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>
      {/* 矢印：ドラッグ中は隠すか位置調整 */}
      {index < total - 1 && (
        <span className="text-zinc-600 mx-1.5 text-xs pointer-events-none italic font-bold">▶</span>
      )}
    </div>
  );
}

export default function ClientCreateForm({ allTags }: { allTags: { id: string; name: string }[] }) {
  // stateの型を SelectedMove[] に変更
  const [selectedMoves, setSelectedMoves] = useState<SelectedMove[]>([]);
  const [tagInput, setTagInput] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);

  // センサーの設定
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), // 5px動いたらドラッグ開始
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

  // 既存タグ、Form処理などは以前と同様
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
  const availableTags = allTags.filter((t) => !tags.includes(t.name));

  return (
    <div className="max-w-4xl mx-auto pb-20 text-zinc-100 min-h-screen">
      
      {/* 入力モニター：ドラッグドロップ対応 */}
      <div className="sticky top-0 z-50 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800 shadow-xl">
        <div className="p-3 max-w-4xl mx-auto flex flex-col gap-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold tracking-widest text-zinc-500 uppercase">Input Sequence</span>
            <Link href="/" className="font-bold text-zinc-500 hover:text-white transition">CANCEL</Link>
          </div>
          
          <div className="min-h-[54px] flex flex-wrap gap-y-3 gap-x-1 items-center relative">
            {selectedMoves.length === 0 && (
              <span className="text-zinc-700 text-[10px] font-mono tracking-tighter uppercase pl-1">
                [ No input recorded ]
              </span>
            )}
            
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
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
        
        {/* 技パネル：デザインロジック継承 */}
        <div className="space-y-4">
          {MOVE_GROUPS.map((group) => (
            <div key={group.category}>
              <h3 className="text-[10px] font-bold text-zinc-600 uppercase mb-1.5 flex items-center gap-2">
                <span className="w-1 h-1 bg-purple-500 rounded-full"></span>{group.category}
              </h3>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-1.5">
                {group.moves.map((move) => {
                  const isSpecial = move.includes("SA") || move.includes("OD");
                  const isSystem = ["DR", "CDR", "パリィスカ", "前ステ", "バクステ"].includes(move);
                  const isPunish = move === "パニカン";
                  const isCounter = move === "カウンター";
                  const isImpact = move === "インパクト";

                  let buttonStyle = "bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-600";
                  if (isPunish) buttonStyle = "bg-orange-950/40 border-orange-700 text-orange-400 hover:bg-orange-800 hover:border-orange-500";
                  else if (isCounter) buttonStyle = "bg-yellow-950/30 border-yellow-800 text-yellow-300 hover:bg-yellow-800 hover:border-yellow-600";
                  else if (isImpact) buttonStyle = "bg-red-950/40 border-red-700 text-red-400 hover:bg-red-800 hover:border-red-500";
                  else if (isSpecial) buttonStyle = "bg-fuchsia-950/40 border-fuchsia-900 text-fuchsia-200 hover:bg-fuchsia-900/60";
                  else if (isSystem) buttonStyle = "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800";

                  return (
                    <button type="button" key={move} onClick={() => addMove(move)} className={`py-2 px-1 text-[11px] font-bold rounded border active:scale-95 transition-colors ${buttonStyle}`}>
                      {move}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* 登録フォーム：selectedMovesの送信形式を文字列に直す */}
        <form action={createCombo} className="space-y-6 pt-4 border-t border-zinc-800">
          <input type="hidden" name="moves" value={selectedMoves.map(m => m.name).join(" > ")} />
          {/* ...その他の hidden input や field は同じ... */}
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
            <div className="flex flex-wrap gap-2 mb-2 min-h-[24px]">
              {tags.map((tag) => (
                <span key={tag} onClick={() => setTags(tags.filter(t => t !== tag))} className="bg-violet-900/30 border border-violet-800 text-violet-300 px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer hover:bg-red-900/30 hover:text-red-300 transition-colors flex items-center gap-1 group">
                  #{tag} <span className="opacity-50 group-hover:opacity-100">×</span>
                </span>
              ))}
            </div>
            <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={addTag} className="bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm p-3 rounded-lg w-full focus:outline-none focus:border-purple-500 transition mb-2" placeholder="新しいタグを入力してEnter" />
            
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

          <button type="submit" disabled={selectedMoves.length === 0} className="w-full bg-gradient-to-r from-violet-700 to-fuchsia-700 hover:from-violet-600 hover:to-fuchsia-600 text-white font-black text-lg p-4 rounded-xl shadow-lg transition active:scale-[0.99] disabled:opacity-30 uppercase tracking-widest">
            Save Record
          </button>
        </form>
      </div>
    </div>
  );
}