"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";

// ============================================================
// 1. マスターデータ・基本設定（コンテンツの内容を変えたい時はここ）
// ============================================================

/**
 * 診断結果の分岐データ
 * * [編集ガイド]
 * - name: プレビューに大きく表示される称号・職業名
 * - text: その下の説明文
 * - img: 使用する画像ファイル名のプレフィックス
 */
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

/**
 * キャンバスのレイアウト設定
 * * [編集ガイド]
 * - CANVAS: 背景画像のパスや基準サイズ
 * - STATUS_ITEMS: 左側の項目のラベルと、背景画像上の「縦位置(top)」
 * - TEXT_ITEMS: 自由入力項目の位置・サイズ・初期フォントサイズ
 * - RATING_X_POSITIONS: 評価1〜5の丸印を描画する「横位置(left)」のリスト
 */
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
    { key: "style", label: "ゲームスタイル", type: "select", options: ["いのちだいじに", "いろいろやろうぜ", "エンジョイ派", "ガンガンいこうぜ", "寄り道大好き", "効率重視", "司令塔型"], top: 340, left: 275, width: 180, fontSize: 22, height: 50 },
  ] as const,

  RATING_X_POSITIONS: [757, 791, 827, 861, 896],
};

// ============================================================
// 2. ユーティリティ・コンポーネント（仕組みの部分）
// ============================================================

/**
 * テキスト自動リサイズ機能
 * 枠からはみ出さないようにフォントサイズを計算します。
 */
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

// ============================================================
// 3. メインロジック
// ============================================================

export default function CollabNote() {
  // 入力フォームの状態管理
  const [data, setData] = useState<Record<string, any>>({
    name: "うにのれむ", anime: "名探偵コナン", manga: "アニメ派", music: "ボカロ", style: "いのちだいじに"
  });

  const previewRef = useRef<HTMLDivElement>(null);
  const update = (key: string, val: any) => setData(p => ({ ...p, [key]: val }));

  /**
   * 診断判定ロジック
   * 11項目の平均値が「3以上(High)」か「3未満(Low)」かで分岐させます。
   */
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

  /**
   * 画像書き出し処理
   */
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

  // ============================================================
  // 4. UI描画
  // ============================================================

  return (
    <main className="min-h-screen bg-stone-100 p-6 flex gap-8 flex-wrap justify-center font-sans">

      {/* --- 左側：操作パネル（入力フォーム） --- */}
      <div className="w-full max-w-[400px] bg-white rounded-2xl shadow-xl p-6 space-y-4 h-fit border border-stone-200">
        <h2 className="text-xl font-bold text-stone-800 border-b pb-2">設定</h2>

        {/* テキスト入力項目の生成 */}
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

        {/* ステータス選択（ボタン） */}
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

      {/* --- 右側：画像プレビュー（スマホでは横幅いっぱいに収める） --- */}
      <div className="p-4 bg-stone-300 rounded-3xl shadow-inner h-fit w-full max-w-[1040px] overflow-hidden">
        {/* 画面幅に応じて高さを保つためのラッパー */}
        <div className="relative w-full" style={{ aspectRatio: '1000 / 707' }}>
          <div ref={previewRef} className="absolute top-0 left-0 origin-top-left bg-white shadow-2xl"
            style={{
              width: '1000px',
              height: '707px',
              // ★ 画面の幅(100%)を1000pxで割った倍率に自動スケール
              transform: `scale(calc(100vw / 1000 * 0.9))`,
              // ※ 0.9は余白分。もし左右がギリギリなら 100vw を調整してください。
              // PCなど大きな画面では scale(1) 以上にならないように工夫も可能です。
              fontFamily: 'var(--font-kiwi-maru), sans-serif'
            }}>

            {/* [レイヤー1] テンプレート背景画像 */}
            <img src={CONFIG.CANVAS.bgUrl} className="absolute inset-0 w-full h-full object-cover" alt="" />

            {/* [レイヤー2] 診断画像表示エリア */}
            <div className="absolute" style={{ bottom: "30px", left: "0px", width: "230px", height: "230px" }}>
              <img src={result.imagePath} className="w-full h-full object-contain" onError={(e) => (e.currentTarget.style.opacity = "0")} />
            </div>

            {/* [レイヤー3] 診断結果：称号と説明文テキストエリア */}
            <div className="absolute" style={{
              bottom: "90px",
              left: "250px",
              width: "200px",
              display: "flex",
              flexDirection: "column", // 縦に並べる
              gap: "8px"               // 称号と説明の間の隙間
            }}>
              {/* 診断結果の名前（大きく別のフォントを使いたい場合はここを編集） */}
              <div style={{
                fontSize: "32px",
                fontWeight: "900",
                color: "#1a1a1a",
                fontFamily: "serif",    // 使用フォント
                lineHeight: "1.1"
              }}>
                {result.resultName}
              </div>

              {/* 診断結果の説明文 */}
              <div style={{
                fontSize: "18px",
                fontWeight: "bold",
                lineHeight: "1.4",
                color: "#444",
                fontFamily: "var(--font-kiwi-maru), sans-serif"
              }}>
                <p className="whitespace-pre-wrap text-left">{result.description}</p>
              </div>
            </div>

            {/* [レイヤー4] 自由入力された各種テキスト（活動者名、アニメなど） */}
            {CONFIG.TEXT_ITEMS.map((item: any) => {
              const isName = item.key === "name";
              return (
                <div
                  key={item.key}
                  className={`absolute flex items-center font-bold text-stone-900 ${isName ? "justify-start pl-4" : "justify-center text-center"}`}
                  style={{ top: item.top, left: item.left, width: item.width, height: item.height || "auto" }}
                >
                  {(item.type === "auto-size-area") ? (
                    <AutoSizeText content={data[item.key] || ""} baseFontSize={item.baseFontSize || 20} />
                  ) : (
                    <div style={{ fontSize: `${item.fontSize}px` }} className={`whitespace-pre-wrap ${isName ? "text-left" : ""}`}>{data[item.key]}</div>
                  )}
                </div>
              );
            })}

            {/* [レイヤー5] ステータス丸印（評価に応じた位置へ配置） */}
            {CONFIG.STATUS_ITEMS.map(item => (
              data[item.key] && (
                <div
                  key={item.key}
                  className="absolute w-[33px] h-[33px] bg-gradient-to-br from-yellow-200 to-amber-400 rounded-full shadow-[0_0_12px_rgba(251,191,36,0.9)] border border-white/50"
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