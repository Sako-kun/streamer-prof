"use client";
import { useRef, useState } from "react";
import { toPng } from "html-to-image";

export default function Home() {
  // ユーザーの入力を管理する「状態(State)」
  const [name, setName] = useState("ここに名前");
  const [like, setLike] = useState("ここに好きなもの");
  const [hate, setHate] = useState("ここに嫌いなもの");

  const elementRef = useRef<HTMLDivElement>(null);
  const onDownload = async () => {
    if (elementRef.current === null) return;

    try {
      // プレビューエリアをPNGデータに変換
      const dataUrl = await toPng(elementRef.current, { cacheBust: true, pixelRatio: 2 });

      // ダウンロード用のリンクを作ってクリックさせる
      const link = document.createElement("a");
      link.download = "my-profile.png";
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("画像の生成に失敗しました", err);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 p-4 flex flex-col items-center gap-6">
      <h1 className="text-2xl font-bold text-gray-800">ストリーマープロフ帳</h1>

      {/* --- 入力エリア --- */}
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">なまえ</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-black focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">すき</label>
          <input
            type="text"
            value={like}
            onChange={(e) => setLike(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-black focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">きらい</label>
          <input
            type="text"
            value={hate}
            onChange={(e) => setHate(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-black focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <button
          onClick={onDownload}
          className="bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700 transition"
        >画像をダウンロード</button>
      </div>

      {/* --- 画像プレビューエリア --- */}
      {/* この id="profile-card" の中身を後で画像化します */}
      <div
        ref={elementRef}
        className="relative shadow-2xl overflow-hidden"
        style={{ width: "810px", height: "1440px", fontSize: "30px", color: "#fafafa", fontFamily: "var(--font-kiwi-maru)" }} // 画像の比率に合わせて調整
      >
        {/* 背景のテンプレート画像 */}
        <img
          src="/template.png"
          alt="profu-template"
          className="absolute inset-0 w-full h-full object-contain"
        />

        <div
          className="absolute"
          style={{
            top: "15%",
            left: "6%",
          }}
        >
          {name}
        </div>

        <div
          className="absolute"
          style={{
            top: "35%",
            left: "6%",
          }}
        >
          {like}
        </div>

        <div
          className="absolute"
          style={{
            top: "67%",
            left: "6%",
          }}
        >
          {hate}
        </div>
      </div>
    </main>
  );
}