# Supabase関連コードの移行計画

## 概要

このドキュメントでは、Supabase関連コードの移行計画について説明します。複数のファイルに分散していたSupabase関連のコードを、`lib/supabase-utils.ts`に統合しました。

## 移行スケジュール

1. **フェーズ1: 新しいファイル構造の導入** (完了)
   - `lib/supabase-utils.ts`の作成
   - 主要な機能の実装

2. **フェーズ2: 既存コードの移行** (完了)
   - 既存のコードを新しいファイルを使用するように更新
   - 非推奨ファイルをスタブファイルに変更

3. **フェーズ3: 非推奨ファイルの削除** (完了)
   - 非推奨ファイルの完全な削除
   - 最終的なコードクリーンアップ

## 削除されたファイル一覧

以下のファイルは削除されました：

- `lib/supabase.ts`
- `lib/supabase-client.ts`
- `lib/supabase/client.ts`
- `lib/supabase/server.ts`
- `lib/supabase/operations.ts`
- `lib/supabase/hooks.ts`
- `lib/supabase/core.ts`
- `lib/supabase/client-operations.ts`
- `lib/supabase/server-operations.ts`
- `lib/supabase/data-access.ts`
- `lib/supabase/index.ts`

## 新しいファイル構造

新しいファイル構造では、すべてのSupabase関連のコードが`lib/supabase-utils.ts`に統合されています。

### 主要な関数

#### クライアント側

- `getClientSupabase()`: クライアント側でSupabaseクライアントを取得
- `fetchClientData()`: クライアント側でデータを取得
- `insertClientData()`: クライアント側でデータを挿入
- `updateClientData()`: クライアント側でデータを更新
- `deleteClientData()`: クライアント側でデータを削除

#### サーバー側

- `getServerSupabase()`: サーバー側でSupabaseクライアントを取得
- `fetchServerData()`: サーバー側でデータを取得
- `insertServerData()`: サーバー側でデータを挿入
- `updateServerData()`: サーバー側でデータを更新
- `deleteServerData()`: サーバー側でデータを削除

## 移行ガイド

### インポートと関数名の更新

\`\`\`typescript
// 古いインポートと関数名
import { getSupabaseClient } from "../lib/supabase"
const supabase = getSupabaseClient()

// 新しいインポートと関数名
import { getClientSupabase } from "../lib/supabase-utils"
const supabase = getClientSupabase()
\`\`\`

### データアクセス関数の更新

\`\`\`typescript
// 古いデータアクセス関数
import { fetchData } from "../lib/supabase/operations"
const result = await fetchData(tableName, options)

// 新しいデータアクセス関数
import { fetchClientData } from "../lib/supabase-utils"
const result = await fetchClientData(tableName, options)
\`\`\`

## 注意事項

- 非推奨ファイルはすべて削除されました。古いインポートを使用しているコードは動作しません。
- 新しいコードでは、必ず`lib/supabase-utils.ts`からインポートするようにしてください。
- 問題が発生した場合は、移行ガイドを参照してください。
\`\`\`

### 3. テスト用のスクリプト作成
