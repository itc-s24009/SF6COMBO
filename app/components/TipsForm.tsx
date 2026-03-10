"use client";
import { useState } from "react";
import Link from "next/link";
import { createTip, updateTip } from "../action"; // ※後でactionsに追記した関数を呼びます

// 格ゲーによくあるキャラクター一覧（自由に増減してください）
const AVAILABLE_CHARS = [
  "リュウ", "ルーク", "ジェイミー", "春麗", "ガイル", "キンバリー", "ジュリ",
  "ケン", "ブランカ", "ダルシム", "E.本田", "ディージェイ", "マノン", "マリーザ", "JP",
  "ザンギエフ","リリー", "キャミィ", "ラシード", "エド","A.K.I.", "豪鬼", "ベガ", "テリー", "舞","エレナ","サガット","C.ヴァイパー","アレックス", "全キャラ"
];

type Props = {
  // edit時は初期値が入る。create時はundefined
  initialData?: {
    id: string;
    title: string;
    content: string;
    characters: { name: string }[];
  };
};

export default function TipsForm({ initialData }: Props) {
  const isEdit = !!initialData;
  const [title, setTitle] = useState(initialData?.title || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [selectedChars, setSelectedChars] = useState<string[]>(
    initialData?.characters.map(c => c.name) || []
  );

  // キャラクタータグのトグル選択
  const toggleChar = (charName: string) => {
    if (selectedChars.includes(charName)) {
      setSelectedChars(selectedChars.filter(c => c !== charName));
    } else {
      setSelectedChars([...selectedChars, charName]);
    }
  };

  return (
    <div className="max-w-3xl mx-auto pb-20 text-zinc-100 min-h-screen">
      
      {/* 常に上に張り付くヘッダー */}
      <div className="sticky top-0 z-50 bg-zinc-950/95 backdrop-blur-md border-b border-cyan-900/40 shadow-xl">
        <div className="p-4 max-w-3xl mx-auto flex justify-between items-center text-xs">
          <span className="font-bold tracking-widest text-cyan-500 uppercase">
            {isEdit ? "Edit Strategy Note" : "New Strategy Note"}
          </span>
          <Link href="/tips" className="font-bold text-zinc-500 hover:text-white transition uppercase">
            Cancel
          </Link>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-8">
        {/* フォーム本体。isEdit に応じて送信先アクションを切り替える */}
        <form action={isEdit ? updateTip : createTip} className="space-y-6">
          
          {/* 編集時のみ必要なID */}
          {isEdit && <input type="hidden" name="id" value={initialData.id} />}
          
          {/* 選ばれたキャラ名をカンマ区切りで送信する隠しフィールド */}
          <input type="hidden" name="characters" value={selectedChars.join(",")} />

          {/* 1. タイトル入力 */}
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 mb-2 uppercase tracking-widest">
              Note Title
            </label>
            <input 
              type="text" 
              name="title" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="bg-zinc-900 border border-zinc-800 text-white text-lg p-3 rounded-lg w-full focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition font-bold shadow-inner" 
              placeholder="例: 画面端の柔道抜け対策" 
            />
          </div>

          {/* 2. 対象キャラクター選択（ボタン式） */}
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 mb-2 uppercase tracking-widest flex items-center justify-between">
              <span>Target Characters</span>
              <span className="text-zinc-600 font-normal normal-case">複数選択可</span>
            </label>
            
            <div className="p-3 bg-zinc-900/50 border border-zinc-800/50 rounded-xl">
              <div className="flex flex-wrap gap-1.5">
                {AVAILABLE_CHARS.map(char => {
                  const isSelected = selectedChars.includes(char);
                  return (
                    <button
                      type="button"
                      key={char}
                      onClick={() => toggleChar(char)}
                      className={`px-3 py-1.5 text-[11px] font-bold rounded-full border transition-all active:scale-95 select-none
                        ${isSelected 
                          ? 'bg-cyan-900/40 text-cyan-300 border-cyan-700 shadow-[0_0_10px_rgba(8,145,178,0.2)]' 
                          : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:bg-zinc-800 hover:text-zinc-300'
                        }`}
                    >
                      {char}
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* 選択中のキャラを表示（確認用） */}
            {selectedChars.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                <span className="text-[10px] text-zinc-600 mr-1 flex items-center">Selected:</span>
                {selectedChars.map(c => (
                  <span key={c} className="text-[10px] text-cyan-400 font-bold">#{c}</span>
                ))}
              </div>
            )}
          </div>

          {/* 3. 本文（解説）入力 */}
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 mb-2 uppercase tracking-widest">
              Strategy Detail
            </label>
            <textarea 
              name="content" 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={8} 
              className="bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm p-4 rounded-lg w-full focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition shadow-inner leading-relaxed resize-y" 
              placeholder="対策の詳細、フレーム状況、意識配分などを記述..."
            ></textarea>
          </div>

          {/* 4. 保存ボタン */}
          <button 
            type="submit" 
            disabled={!title.trim() || !content.trim()} 
            className="group relative w-full overflow-hidden bg-cyan-600 text-white font-black text-lg p-4 rounded-xl shadow-[0_0_20px_rgba(8,145,178,0.2)] hover:shadow-[0_0_30px_rgba(8,145,178,0.4)] transition-all active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed uppercase tracking-widest italic mt-8"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {isEdit ? "Update Note" : "Save Note"} ⚡
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600 group-hover:opacity-90"></div>
          </button>

        </form>
      </div>
    </div>
  );
}