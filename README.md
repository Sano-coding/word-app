# 単語帳アプリ（word-app）

単語の登録・フラッシュカード・4択クイズで暗記学習ができる単語暗記アプリです。データはSupabase（PostgreSQL）に保存され、メールアドレス＋パスワードでログインすれば、PC・スマホなど複数端末から同じ単語帳データを利用できます。

**公開URL**：https://sano-coding.github.io/word-app/

## 主な機能

- メールアドレス＋パスワードによるアカウント登録・ログイン（複数端末で同じデータを共有）
- 単語帳・単語の登録（手動登録／CSVインポート）
- 単語ごとに「定着度」「フラッシュカード出題状況」「4択クイズ出題状況」「スター」「補足」を管理
- フラッシュカード・4択クイズによる出題（定着度・スター・出題状況での絞り込み、登録順／ランダム出題、セッション中断対応）
- 新規アカウント作成時に、お試し用のデフォルト単語帳「英検３級」（100単語）を自動生成
- Supabase移行前にブラウザのlocalStorageへ保存されていたデータを、初回ログイン後にクラウドへ一括アップロードできる移行機能

## 技術スタック

- React + TypeScript + Vite
- React Router（ルーティング）
- Vitest（単体テスト）
- Supabase（PostgreSQL＋Row Level Security、認証）：`@supabase/supabase-js` 経由でリポジトリ層から利用（リポジトリ層で抽象化しているため、実装差し替えの影響範囲を局所化）
- GitHub Pages＋GitHub Actionsで自動デプロイ（`master`へのpushで`https://sano-coding.github.io/word-app/`へ反映）

## セットアップ

```bash
npm install
cp .env.example .env   # VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY を設定
npm run dev
```

`http://localhost:5173` で開発サーバーが起動します。Supabaseのプロジェクト作成・`supabase/schema.sql`の実行（テーブル・RLSポリシー作成）が別途必要です。

## スクリプト

| コマンド | 内容 |
|---|---|
| `npm run dev` | 開発サーバーを起動 |
| `npm run build` | 型チェック＋本番ビルド |
| `npm run test` | Vitestで単体テストを実行 |
| `npm run lint` | Oxlintで静的解析 |
| `npm run preview` | ビルド済みファイルをローカルで確認 |

## 関連ドキュメント

- [`word-app-screens_1.md`](./word-app-screens_1.md)：画面ごとの目的・表示要素・操作の詳細仕様
- [`word-app-gui.md`](./word-app-gui.md)：サイドバー・ヘッダー・アイコン規則など画面横断的なGUIルール
- [`今後の展望.md`](./今後の展望.md)：フレンド・サーチ・ランキング・スマホアプリ化など今後の拡張構想

## ディレクトリ構成（概要）

```
src/
  types/          # Account / Tanchou / Word などの型定義
  lib/            # Supabaseクライアントの初期化
  repositories/   # Supabaseアクセスを抽象化したデータ層（localStorage移行用の読み出しも含む）
  domain/         # 定着度の状態遷移・CSVパース・出題キュー生成などの純粋なロジック
  context/        # 認証セッション（AuthContext）・アカウント状態（AccountContext）のReact Context
  components/     # 画面共通・機能別のUIコンポーネント
  pages/          # 各画面（ルートごとのページコンポーネント）
supabase/
  schema.sql      # Supabaseのテーブル定義・RLSポリシー（SQL Editorで実行する用）
```
