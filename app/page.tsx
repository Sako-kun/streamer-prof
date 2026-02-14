"use client";
import { useRef, useState } from "react";
import { toPng } from "html-to-image";

// --- 共通パーツ1: 入力フィールド ---
const InputField = ({ label, value, onChange, isTextArea = false }: any) => (
  <div>
    <label className="block text-sm font-bold text-gray-700 mb-1">{label}</label>
    {isTextArea ? (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="w-full border border-gray-300 rounded-md p-2 text-black focus:ring-2 focus:ring-blue-500 outline-none resize-none"
      />
    ) : (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-300 rounded-md p-2 text-black focus:ring-2 focus:ring-blue-500 outline-none"
      />
    )}
  </div>
);

// --- 共通パーツ2: プレビュー文字 ---
const PreviewText = ({ content, top, width = "85%", fontSize = "50px" }: any) => (
  <div 
    className="absolute font-bold whitespace-pre-wrap break-all" 
    style={{ top, left: "10%", width, fontSize, lineHeight: "1.4" }}
  >
    {content}
  </div>
);

export default function Home() {
  const [formData, setFormData] = useState({
    name: "ここに名前",
    like: "ここに好きなもの",
    hate: "ここに嫌いなもの",
    comment: "ここにコメント"
  });

  const elementRef = useRef<HTMLDivElement>(null);

  const onDownload = async () => {
    if (!elementRef.current) return;
    try {
      const dataUrl = await toPng(elementRef.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement("a");
      link.download = "my-profile.png";
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("生成失敗", err);
    }
  };

  // 入力更新用のショートカット関数
  const updateField = (field: string) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <main className="min-h-screen bg-gray-100 p-4 lg:p-10 text-black font-sans">
      <h1 className="text-2xl font-bold text-center mb-8">ストリーマープロフ帳</h1>

      <div className="flex flex-col lg:flex-row items-start justify-center gap-6 max-w-6xl mx-auto">
        
        {/* --- 左側：入力エリア --- */}
        <div className="w-full lg:w-[400px] lg:sticky lg:top-4 bg-white p-6 rounded-xl shadow-md flex flex-col gap-4">
          <h2 className="text-lg font-bold border-b pb-2">入力設定</h2>
          
          <InputField label="なまえ" value={formData.name} onChange={updateField("name")} />
          <InputField label="すき" value={formData.like} onChange={updateField("like")} isTextArea />
          <InputField label="きらい" value={formData.hate} onChange={updateField("hate")} isTextArea />
          <InputField label="コメント" value={formData.comment} onChange={updateField("comment")} isTextArea />

          <button
            onClick={onDownload}
            className="mt-4 bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition active:scale-95 shadow-md"
          >
            画像を保存する
          </button>
        </div>

        {/* --- 右側：プレビューエリア --- */}
        <div className="flex-1 flex justify-center overflow-hidden bg-gray-200 rounded-xl p-4">
          <div
            ref={elementRef}
            className="relative bg-white shadow-2xl origin-top"
            style={{
              width: "810px",
              height: "1440px",
              color: "#fafafa",
              fontFamily: "var(--font-kiwi-maru)",
              zoom: "0.5" // 0.7で切れる場合は少し小さくするか親のmin-hを調整
            }}
          >
            <img src="/template.png" alt="" className="absolute inset-0 w-full h-full object-contain" />

            <PreviewText content={formData.name} top="10.5%" />
            <PreviewText content={formData.like} top="27%" />
            <PreviewText content={formData.hate} top="53%" />
            <PreviewText content={formData.comment} top="78.5%" />
          </div>
        </div>
      </div>
    </main>
  );
}