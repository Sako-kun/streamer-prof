# Streamer Profile Card Generator 📋✨

Next.js と Tailwind CSS で構築した、ストリーマー・VTuber向けの「プロフ帳」画像生成ツールです。
左側の入力フォームでリアルタイムに編集し、理想のプロフ画像をワンタップで書き出せます。

## 🚀 特徴

- **リアルタイム・プレビュー**: 入力した内容がその場で 1600×900（または 810×1440）の高品質キャンバスに反映されます。
- **レスポンシブ・レイアウト**: 
  - PCでは「左に入力、右にプレビュー」のサイドバー方式を採用。
  - `Sticky` 指定により、長い項目を入力中もプレビューが画面内に固定されます。
- **高画質書き出し**: `html-to-image` を使用。`pixelRatio: 2` 設定により、SNS投稿にも耐えうるクッキリとした画像を生成します。
- **コンポーネント設計**: React のパーツ化（`InputField`, `PreviewText`）により、項目の追加やスタイルの変更が容易です。

## 🛠 使用技術

- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS
- **Library**: `html-to-image` (DOM to PNG 変換)
- **Fonts**: Google Fonts (Kiwi Maru / Zen Kurenaido 等)

## 📁 フォルダ構造

```text
src/
 ├── app/
 │    ├── layout.tsx    # Google Fonts の読み込み設定
 │    └── page.tsx      # メインロジック、コンポーネント、UI
 └── public/
      └── template.png  # 背景となるプロフ帳のテンプレート画像