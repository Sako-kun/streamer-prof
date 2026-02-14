"use client";
import { useState } from "react";

export default function Home() {
  // ユーザーの入力を管理する「状態(State)」
  const [name, setName] = useState("ここに名前");
  const [hobby, setHobby] = useState("ここに趣味");

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
          <label className="block text-sm font-medium text-gray-700">しゅみ</label>
          <input
            type="text"
            value={hobby}
            onChange={(e) => setHobby(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-black"
          />
        </div>
      </div>

      {/* --- 画像プレビューエリア --- */}
      {/* この id="profile-card" の中身を後で画像化します */}
      <div 
        id="profile-card"
        className="relative shadow-2xl overflow-hidden"
        style={{ width: "400px", height: "560px" }} // 画像の比率に合わせて調整
      >
        {/* 背景のテンプレート画像 */}
        <img 
          src="/template.png" 
          alt="profu-template" 
          className="absolute inset-0 w-full h-full object-contain"
        />

        {/* 重ねるテキスト：名前 */}
        <div 
          className="absolute text-xl font-bold text-gray-800"
          style={{ 
            top: "20%",  // 画像の上から20%の位置（適宜調整）
            left: "30%", // 画像の左から30%の位置（適宜調整）
          }}
        >
          {name}
        </div>

        {/* 重ねるテキスト：趣味 */}
        <div 
          className="absolute text-lg text-gray-700"
          style={{ 
            top: "45%", 
            left: "30%", 
          }}
        >
          {hobby}
        </div>
      </div>
      
      <p className="text-sm text-gray-500">※位置がズレている場合は top/left の % を調整してください</p>
    </main>
  );
}