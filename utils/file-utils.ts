/**
 * ファイル名を安全な形式に変換する関数
 *
 * @param fileName 元のファイル名
 * @returns 安全なファイル名
 */
export function sanitizeFileName(fileName: string): string {
  // 拡張子を取得
  const extension = fileName.split(".").pop() || ""

  // ファイル名からランダムな文字列を生成
  const randomString = Math.random().toString(36).substring(2, 15)

  // タイムスタンプを追加
  const timestamp = Date.now()

  // 安全なファイル名を生成
  return `${timestamp}-${randomString}.${extension}`
}

/**
 * ファイルサイズを人間が読みやすい形式に変換する関数
 *
 * @param bytes ファイルサイズ（バイト）
 * @returns 読みやすい形式のファイルサイズ
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

/**
 * ファイルの種類を取得する関数
 *
 * @param fileName ファイル名
 * @returns ファイルの種類（拡張子）
 */
export function getFileType(fileName: string): string {
  const extension = fileName.split(".").pop()?.toLowerCase() || ""
  return extension
}

/**
 * ファイルが画像かどうかを判定する関数
 *
 * @param fileName ファイル名
 * @returns 画像ファイルの場合はtrue
 */
export function isImageFile(fileName: string): boolean {
  const imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "webp", "svg"]
  const extension = getFileType(fileName)
  return imageExtensions.includes(extension)
}

/**
 * ファイルがPDFかどうかを判定する関数
 *
 * @param fileName ファイル名
 * @returns PDFファイルの場合はtrue
 */
export function isPdfFile(fileName: string): boolean {
  return getFileType(fileName) === "pdf"
}

/**
 * ファイルをBase64形式に変換する関数
 *
 * @param file 変換するファイル
 * @returns Promise<string> Base64形式の文字列
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = (error) => reject(error)
  })
}

/**
 * URLからファイルパスを抽出する関数
 *
 * @param url ファイルのURL
 * @param bucketName バケット名
 * @returns ファイルパス
 */
export function extractFilePathFromUrl(url: string, bucketName: string): string {
  try {
    // URLからパスを抽出
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split("/")

    // バケット名の位置を見つける
    const bucketIndex = pathParts.findIndex((part) => part === bucketName)

    if (bucketIndex === -1) {
      throw new Error(`バケット名 ${bucketName} がURLに見つかりません`)
    }

    // バケット名以降のパスを結合
    return pathParts.slice(bucketIndex + 1).join("/")
  } catch (error) {
    console.error("URLからファイルパスの抽出に失敗しました:", error)
    // フォールバック: URLをそのまま返す
    return url
  }
}
