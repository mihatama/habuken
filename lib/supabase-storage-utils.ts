import { createClient } from "@supabase/supabase-js"

// バケット名を定数として定義
export const STORAGE_BUCKET_NAME = "genba"
export const STORAGE_FOLDER_NAME = "public/genba_files"

/**
 * Supabaseのストレージバケットが存在するか確認し、存在しない場合は作成する
 */
export async function ensureStorageBucketExists() {
  try {
    // サービスロールキーを使用してSupabaseクライアントを作成
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("環境変数が設定されていません")
      return { success: false, error: "サーバー設定が不完全です" }
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    })

    // バケットの一覧を取得
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()

    if (listError) {
      console.error("バケット一覧取得エラー:", listError)
      return { success: false, error: listError }
    }

    console.log(
      "既存のバケット:",
      buckets?.map((b) => b.name),
    )

    // genbaバケットが存在するか確認
    const genbaExists = buckets?.some((bucket) => bucket.name === STORAGE_BUCKET_NAME)

    if (!genbaExists) {
      console.log(`${STORAGE_BUCKET_NAME}バケットが存在しないため作成します`)

      // バケットを作成
      const { data, error: createError } = await supabase.storage.createBucket(STORAGE_BUCKET_NAME, {
        public: true, // 公開バケットとして作成
      })

      if (createError) {
        console.error("バケット作成エラー:", createError)
        return { success: false, error: createError }
      }

      console.log(`${STORAGE_BUCKET_NAME}バケットを作成しました:`, data)

      // バケットのポリシーを設定
      await setupBucketPolicies(supabase)
    } else {
      console.log(`${STORAGE_BUCKET_NAME}バケットは既に存在します`)
    }

    return { success: true }
  } catch (error) {
    console.error("予期しないエラー:", error)
    return { success: false, error }
  }
}

/**
 * バケットのポリシーを設定する
 */
async function setupBucketPolicies(supabase: any) {
  try {
    // SQLを直接実行してポリシーを設定
    const { error: policyError } = await supabase.rpc("setup_genba_bucket_policies")

    if (policyError) {
      console.error("ポリシー設定エラー:", policyError)

      // RPC関数が存在しない場合は、代替方法でポリシーを設定
      console.log("代替方法でポリシーを設定します")

      // 既存のポリシーを削除
      try {
        await supabase.query(`
          drop policy if exists "Public Access" on storage.objects;
          drop policy if exists "Authenticated users can upload files" on storage.objects;
          drop policy if exists "Users can delete their own files" on storage.objects;
        `)
      } catch (e) {
        console.log("既存ポリシー削除中のエラー（無視します）:", e)
      }

      // 閲覧ポリシー - 誰でも閲覧可能
      await supabase.query(`
        create policy "Public Access"
        on storage.objects for select
        using (bucket_id = '${STORAGE_BUCKET_NAME}');
      `)

      // アップロードポリシー - 認証済みユーザーはどこにでもアップロード可能
      await supabase.query(`
        create policy "Authenticated users can upload files"
        on storage.objects for insert
        to authenticated
        with check (bucket_id = '${STORAGE_BUCKET_NAME}');
      `)

      // 更新ポリシー - 認証済みユーザーは更新可能
      await supabase.query(`
        create policy "Authenticated users can update files"
        on storage.objects for update
        to authenticated
        using (bucket_id = '${STORAGE_BUCKET_NAME}');
      `)

      // 削除ポリシー - 認証済みユーザーは削除可能
      await supabase.query(`
        create policy "Authenticated users can delete files"
        on storage.objects for delete
        to authenticated
        using (bucket_id = '${STORAGE_BUCKET_NAME}');
      `)
    }

    return { success: true }
  } catch (error) {
    console.error("ポリシー設定中のエラー:", error)
    return { success: false, error }
  }
}
