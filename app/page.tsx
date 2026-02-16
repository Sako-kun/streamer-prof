"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";

const CONFIG = {
  CANVAS: { width: 1000, height: 707, scale: 1, bgUrl: "/template.png" },
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
    { key: "style", label: "ゲームスタイル", type: "select", options: ["いのちだいじに", "ガンガンいこうぜ", "効率重視", "エンジョイ派"], top: 340, left: 275, width: 180, fontSize: 22, height: 50 },
  ] as const,
  RATING_X_POSITIONS: [757, 791, 827, 861, 896],
};

const AutoSizeText = ({ content, baseFontSize }: { content: string, baseFontSize: number }) => {
  const text = content || "";
  const lineCount = text.split('\n').length;
  let fontSize = text.length > 10
    ? Math.max(10, baseFontSize * (10 / text.length))
    : baseFontSize;

  if (lineCount > 2) fontSize *= 0.85;

  return (
    <div style={{ fontSize: `${fontSize}px` }} className="whitespace-pre-wrap leading-tight break-all">
      {text}
    </div>
  );
};

export default function CollabNote() {
  const [data, setData] = useState<Record<string, any>>({
    name: "うにのれむ", anime: "名探偵コナン", manga: "アニメ派", music: "ボカロ", style: "いのちだいじに"
  });
  const previewRef = useRef<HTMLDivElement>(null);

  const update = (key: string, val: any) => setData(p => ({ ...p, [key]: val }));

  const download = async () => {
    if (!previewRef.current) return;
    const el = previewRef.current;

    // Vercel(本番環境)でフォントを確実に読み込ませるための待機
    await new Promise((resolve) => setTimeout(resolve, 500));

    const oldTransform = el.style.transform;
    el.style.transform = "none";
    const url = await toPng(el, { pixelRatio: 2, cacheBust: true });
    el.style.transform = oldTransform;
    const a = document.createElement("a");
    a.download = "note.png"; a.href = url; a.click();
  };

  return (
    <main className="min-h-screen bg-stone-100 p-6 flex gap-8 flex-wrap justify-center font-sans">
      <div className="w-[400px] bg-white rounded-2xl shadow-xl p-6 space-y-4 h-fit border border-stone-200">
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
                rows={2}
                value={data[item.key] || ""}
                onChange={e => update(item.key, e.target.value)}
                placeholder="改行入力可"
              />
            ) : (
              <input className="w-full border border-gray-400 rounded-lg p-2 text-sm text-gray-900 font-medium"
                value={data[item.key] || ""} onChange={e => update(item.key, e.target.value)} />
            )}
          </div>
        ))}

        <div className="pt-4 space-y-3 border-t">
          <label className="text-xs font-bold text-stone-500 uppercase block">ステータス</label>
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

      <div className="p-4 bg-stone-300 rounded-3xl shadow-inner h-fit">
        <div style={{ width: CONFIG.CANVAS.width * CONFIG.CANVAS.scale, height: CONFIG.CANVAS.height * CONFIG.CANVAS.scale }}>
          <div ref={previewRef} className="relative origin-top-left bg-white shadow-2xl" style={{ width: CONFIG.CANVAS.width, height: CONFIG.CANVAS.height, transform: `scale(${CONFIG.CANVAS.scale})`, fontFamily: 'var(--font-kiwi-maru), sans-serif' }}>
            <img src={CONFIG.CANVAS.bgUrl} className="absolute inset-0 w-full h-full object-cover" alt="" />
            {CONFIG.TEXT_ITEMS.map((item: any) => {
              // 活動者名(name)か、それ以外かを判定する
              const isName = item.key === "name";

              return (
                <div
                  key={item.key}
                  className={`absolute flex items-center font-bold text-stone-900 ${
                    // nameなら「左寄せ(justify-start)」、それ以外なら「中央寄せ(justify-center)」
                    isName ? "justify-start pl-4" : "justify-center text-center"
                    }`}
                  style={{
                    top: item.top,
                    left: item.left,
                    width: item.width,
                    height: item.height || "auto"
                  }}
                >
                  {(item.type === "auto-size-area") ? (
                    <AutoSizeText content={data[item.key] || ""} baseFontSize={item.baseFontSize || 20} />
                  ) : (
                    <div
                      style={{ fontSize: `${item.fontSize}px` }}
                      // nameなら「左揃え(text-left)」、それ以外なら「指定なし(結果的に中央になる)」
                      className={`whitespace-pre-wrap ${isName ? "text-left" : ""}`}
                    >
                      {data[item.key]}
                    </div>
                  )}
                </div>
              );
            })}
            {CONFIG.STATUS_ITEMS.map(item => (
              data[item.key] && (
                <div key={item.key} className="absolute w-[33px] h-[33px] bg-gradient-to-br from-yellow-200 to-amber-400 rounded-full shadow-[0_0_12px_rgba(251,191,36,0.9)] border border-white/50"
                  style={{ top: item.top, left: CONFIG.RATING_X_POSITIONS[data[item.key] - 1] }} />
              )
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}