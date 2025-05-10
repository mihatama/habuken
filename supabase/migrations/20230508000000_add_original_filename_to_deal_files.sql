-- deal_filesテーブルにoriginal_file_nameカラムを追加
ALTER TABLE public.deal_files ADD COLUMN original_file_name VARCHAR(255);

-- 既存のレコードについては、file_nameの値をoriginal_file_nameにコピー
UPDATE public.deal_files SET original_file_name = file_name WHERE original_file_name IS NULL;

-- original_file_nameにNOT NULL制約を追加
ALTER TABLE public.deal_files ALTER COLUMN original_file_name SET NOT NULL;

-- インデックスを追加してパフォーマンスを向上
CREATE INDEX idx_deal_files_original_file_name ON public.deal_files(original_file_name);
