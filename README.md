# 採用管理システム（最小構成）

応募者を「応募 → 書類選考 → 面接 → 内定 → 入社 → 退職」まで一元管理する Web アプリ。
Next.js (App Router) + TypeScript + Tailwind CSS + Supabase。データは Supabase(DB) に保存され、複数人・複数端末で共有できます。

## 機能
- 応募者一覧（氏名・応募日・応募経路・ステータス）＋ ステータス絞り込み
- 応募者の追加
- 詳細ページ：連絡先・入社日・メモの編集、ステータス変更、ステータス履歴の自動記録
- スマホ対応（レスポンシブ）

## セットアップ

### 1. Supabase プロジェクトを作成
1. https://supabase.com にサインインし「New project」を作成
2. 作成後、左メニュー **SQL Editor** を開き、`supabase/schema.sql` の中身を貼り付けて **Run**
   （applicants / status_history テーブルと履歴トリガーが作成されます）
3. 左メニュー **Project Settings > API** から以下をコピー
   - `Project URL`
   - `anon public` key

### 2. 環境変数
`.env.local.example` をコピーして `.env.local` を作成し、値を貼り付け：
```
NEXT_PUBLIC_SUPABASE_URL=（Project URL）
NEXT_PUBLIC_SUPABASE_ANON_KEY=（anon public key）
```

### 3. 起動
```bash
npm install
npm run dev
```
http://localhost:3000 を開く。

## デプロイ（任意）
Vercel にインポートし、同じ 2 つの環境変数を設定すれば公開できます。

## セキュリティ注意
MVP のため RLS は anon キーで全読み書きを許可しています。
社内本番利用時は Supabase Auth によるログインと、ユーザー単位の RLS ポリシー導入を推奨します。
