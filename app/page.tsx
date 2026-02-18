"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";

// ============================================================
// 1. マスターデータ・基本設定
// ============================================================

const RESULT_MASTER: Record<string, Record<string, { img: string; name: string; text: string }>> = {
  "いのちだいじに": {
    high: { img: "inochi", name: "僧侶", text: "他者の痛みに敏感で思いやりに長けている。" },
    low: { img: "inochi", name: "守護者", text: "正義感が強く、ルールや仲間を徹底して守る。" }
  },
  "いろいろやろうぜ": {
    high: { img: "iroiro", name: "盗賊", text: "フットワークが軽く、チャンスを逃さず手に入れる。" },
    low: { img: "iroiro", name: "吟遊詩人", text: "人の気持ちを考えることができる。 ユーモアがあり、型破りな一面も。" }
  },
  "エンジョイ派": {
    high: { img: "enjoy", name: "踊り子", text: "自己表現が豊かで、自分の好きなファッションやスタイルを貫くことでモチベーションが上がる。" },
    low: { img: "enjoy", name: "冒険家", text: "人との繋がりを大切にし、win-winな関係を築く。" }
  },
  "ガンガンいこうぜ": {
    high: { img: "gangan", name: "バーサーカー", text: "一度火が付くと止まらない、圧倒的な推進力の持ち主。" },
    low: { img: "gangan", name: "サムライ", text: " 独自のこだわりや美学を持ち、筋を通す。" }
  },
  "寄り道大好き": {
    high: { img: "yorimichi", name: "海賊", text: "既存の枠にとらわれず、新しい世界を冒険する。" },
    low: { img: "yorimichi", name: "狩人", text: "フットワークが軽く、チャンスを逃さず手に入れる。" }
  },
  "効率重視": {
    high: { img: "kouritsu", name: "魔法戦士", text: "論理と行動の両方を使いこなすバランス型。" },
    low: { img: "kouritsu", name: "暗殺者", text: "裏方で静かに、かつ確実に最短ルートで成果を出す。" }
  },
  "司令塔型": {
    high: { img: "shireito", name: "勇者", text: "悩むよりも「まずやってみる」。リスクよりも可能性に目が向く。他の人を引っ張る力がある。" },
    low: { img: "shireito", name: "賢者", text: "客観的な視点で物事の心理を見抜き、助言する。人を思いやることができる。" }
  }
};

const CONFIG = {
  // scale: 1.0 だと実寸(1000px)、画面に収まらない場合は 0.8 などに下げてください
  CANVAS: { width: 1000, height: 707, scale: 1.0, bgUrl: "/template.png" },

  STATUS_ITEMS: [
    { key: "school", label: "学生時代の話", top: 200 },
    { key: "dirty", label: "下ネタの話", top: 239 },
    { key: "romance", label: "交際歴の話", top: 279 },
    { key: "smoke", label: "たばこ・お酒の話", top: 318 },
    { key: "home", label: "出身地/住まいの話", top: 360 },
    { key: "gender", label: "性別の話", top: 397 },
    { key: "job", label: "仕事/職業の話", top: 439 },
    { key: "meta", label: "配信環境/メタの話", top: 477 },
    { key: "sick", label: "持病/精神疾患の話", top: 516 },
    { key: "family", label: "家族構成の話", top: 552 },
    { key: "relate", label: "人間関係の話", top: 590 },
  ] as const,

  TEXT_ITEMS: [
    { key: "name", label: "活動者名", type: "text", top: 35, left: 410, fontSize: 32, width: 400, height: 50 },
    { key: "anime", label: "語れるアニメ", type: "auto-size-area", top: 180, left: 44, width: 180, height: 60, baseFontSize: 28 },
    { key: "manga", label: "マンガ派？アニメ派？", type: "select", options: ["マンガ派", "アニメ派", "どっちも!!"], top: 185, left: 275, width: 180, fontSize: 30, height: 50 },
    { key: "music", label: "音楽ジャンル", type: "auto-size-area", top: 340, left: 43, width: 180, height: 60, baseFontSize: 30 },
    { key: "style", label: "ゲームスタイル", type: "select", options: ["いのちだいじに", "いろいろやろうぜ", "エンジョイ派", "ガンガンいこうぜ", "寄り道大好き", "効率重視", "司令塔型"], top: 340, left: 275, width: 180, fontSize: 22, height: 50 },
  ] as const,

  RATING_X_POSITIONS: [757, 791, 827, 861, 896],
};

// ============================================================
// 2. ユーティリティ・コンポーネント
// ============================================================

const AutoSizeText = ({ content, baseFontSize }: { content: string, baseFontSize: number }) => {
  const text = content || "";
  const lineCount = text.split('\n').length;
  let fontSize = text.length > 10 ? Math.max(10, baseFontSize * (10 / text.length)) : baseFontSize;
  if (lineCount > 2) fontSize *= 0.85;

  return (
    <div style={{ fontSize: `${fontSize}px` }} className="whitespace-pre-wrap leading-tight break-all">
      {text}
    </div>
  );
};

// ============================================================
// 3. メインコンポーネント
// ============================================================

export default function CollabNote() {
  const [data, setData] = useState<Record<string, any>>({
    name: "うにのれむ", anime: "名探偵コナン", manga: "アニメ派", music: "ボカロ", style: "いのちだいじに"
  });

  const previewRef = useRef<HTMLDivElement>(null);
  const update = (key: string, val: any) => setData(p => ({ ...p, [key]: val }));

  const getResultInfo = () => {
    const statusKeys = CONFIG.STATUS_ITEMS.map(item => item.key);
    const values = statusKeys.map(key => Number(data[key]) || 3);
    const average = values.reduce((a, b) => a + b, 0) / values.length;

    const suffix = average >= 3 ? "high" : "low";
    const currentResult = RESULT_MASTER[data.style] || RESULT_MASTER["エンジョイ派"];
    const final = currentResult[suffix];

    return {
      imagePath: `/results/${final.img}_${suffix}.png`,
      resultName: final.name,
      description: final.text
    };
  };

  const result = getResultInfo();

  const download = async () => {
    if (!previewRef.current) return;
    const el = previewRef.current;
    await new Promise((resolve) => setTimeout(resolve, 500));
    const oldTransform = el.style.transform;
    el.style.transform = "none";
    const url = await toPng(el, { pixelRatio: 2, cacheBust: true });
    el.style.transform = oldTransform;
    const a = document.createElement("a");
    a.download = "note.png"; a.href = url; a.click();
  };

  return (
    <main className="min-h-screen bg-stone-100 p-6 flex gap-8 flex-nowrap justify-center font-sans">

      {/* --- 左側：操作パネル --- */}
      <div className="w-[400px] flex-shrink-0 bg-white rounded-2xl shadow-xl p-6 space-y-4 h-fit border border-stone-200">
        <h2 className="text-xl font-bold text-stone-800 border-b pb-2">設定</h2>
        {CONFIG.TEXT_ITEMS.map((item: any) => (
          <div key={item.key} className="space-y-1">
            <label className="text-xs font-bold text-stone-800 uppercase">{item.label}</label>
            {item.type === "select" ? (
              <select className="w-full border border-gray-400 rounded-lg p-2 text-sm bg-stone-50 text-gray-900 font-medium"
                value={data[item.key]} onChange={e => update(item.key, e.target.value)}>
                {item.options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            ) : (item.type === "auto-size-area") ? (
              <textarea className="w-full border border-gray-400 rounded-lg p-2 text-sm text-gray-900 font-medium"
                rows={2} value={data[item.key] || ""} onChange={e => update(item.key, e.target.value)} placeholder="改行入力可" />
            ) : (
              <input className="w-full border border-gray-400 rounded-lg p-2 text-sm text-gray-900 font-medium"
                value={data[item.key] || ""} onChange={e => update(item.key, e.target.value)} />
            )}
          </div>
        ))}
        <div className="pt-4 space-y-3 border-t">
          {CONFIG.STATUS_ITEMS.map(item => (
            <div key={item.key} className="flex items-center justify-between text-sm">
              <span className="text-stone-700">{item.label}</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} onClick={() => update(item.key, n)} className={`w-7 h-7 rounded-full border text-[10px] transition ${data[item.key] === n ? "bg-amber-500 text-white border-amber-600 shadow-inner" : "bg-stone-50 text-stone-400"}`}>{n}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <button onClick={download} className="w-full bg-amber-700 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-amber-800 transition">画像を保存する</button>
      </div>

      {/* --- 右側：画像プレビュー (PC用固定表示) --- */}
      <div className="p-4 bg-stone-300 rounded-3xl shadow-inner h-fit overflow-auto">
        {/* キャンバスの外枠：scaleがかかった状態のサイズを計算して保持 */}
        <div style={{ 
          width: CONFIG.CANVAS.width * CONFIG.CANVAS.scale, 
          height: CONFIG.CANVAS.height * CONFIG.CANVAS.scale 
        }}>
          <div ref={previewRef} className="relative origin-top-left bg-white shadow-2xl" 
            style={{ 
              width: `${CONFIG.CANVAS.width}px`, 
              height: `${CONFIG.CANVAS.height}px`, 
              transform: `scale(${CONFIG.CANVAS.scale})`, 
              fontFamily: 'var(--font-kiwi-maru), sans-serif' 
            }}>

            <img src={CONFIG.CANVAS.bgUrl} className="absolute inset-0 w-full h-full object-cover" alt="" />

            {/* 診断画像 */}
            <div className="absolute" style={{ bottom: "30px", left: "0px", width: "230px", height: "230px" }}>
              <img src={result.imagePath} className="w-full h-full object-contain" onError={(e) => (e.currentTarget.style.opacity = "0")} />
            </div>

            {/* 称号と説明文 */}
            <div className="absolute" style={{ bottom: "90px", left: "250px", width: "200px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ fontSize: "32px", fontWeight: "900", color: "#1a1a1a", fontFamily: "serif", lineHeight: "1.1" }}>
                {result.resultName}
              </div>
              <div style={{ fontSize: "18px", fontWeight: "bold", lineHeight: "1.4", color: "#444", fontFamily: "var(--font-kiwi-maru), sans-serif" }}>
                <p className="whitespace-pre-wrap text-left">{result.description}</p>
              </div>
            </div>

            {/* 各種テキスト項目 */}
            {CONFIG.TEXT_ITEMS.map((item: any) => {
              const isName = item.key === "name";
              return (
                <div key={item.key} className={`absolute flex items-center font-bold text-stone-900 ${isName ? "justify-start pl-4" : "justify-center text-center"}`}
                  style={{ top: item.top, left: item.left, width: item.width, height: item.height || "auto" }}>
                  {(item.type === "auto-size-area") ? (
                    <AutoSizeText content={data[item.key] || ""} baseFontSize={item.baseFontSize || 20} />
                  ) : (
                    <div style={{ fontSize: `${item.fontSize}px` }} className={`whitespace-pre-wrap ${isName ? "text-left" : ""}`}>{data[item.key]}</div>
                  )}
                </div>
              );
            })}

            {/* ステータス丸印 */}
            {CONFIG.STATUS_ITEMS.map(item => (
              data[item.key] && (
                <div key={item.key} className="absolute w-[33px] h-[33px] bg-gradient-to-br from-yellow-200 to-amber-400 rounded-full shadow-[0_0_12px_rgba(251,191,36,0.9)] border border-white/50"
                  style={{ top: item.top, left: CONFIG.RATING_X_POSITIONS[data[item.key] - 1] }}
                />
              )
            ))}

          </div>
        </div>
      </div>
    </main>
  );
}