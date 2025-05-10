/**
 * ファイルをBase64形式に変換する
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = (error) => reject(error)
  })
}

/**
 * ファイル名をサニタイズする
 */
export const sanitizeFileName = (fileName: string): string => {
  // 安全でないキャラクターを置換
  return fileName
    .replace(/[^a-zA-Z0-9-_]/g, "_") // 英数字、ハイフン、アンダースコア以外を置換
    .replace(/_{2,}/g, "_") // 連続するアンダースコアを1つに
    .replace(/^_|_$/g, "") // 先頭と末尾のアンダースコアを削除
    .substring(0, 100) // 長さを制限
}

/**
 * URLからファイルパスを抽出する
 */
export const extractFilePathFromUrl = (url: string, bucketName = "genba"): string => {
  try {
    // URLからパスを抽出
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split("/")

    // バケット名の後のパスを取得
    const bucketIndex = pathParts.indexOf(bucketName)
    if (bucketIndex !== -1) {
      return pathParts.slice(bucketIndex + 1).join("/")
    }

    // バケット名が見つからない場合は、public/genba/以下のパスを想定
    return `public/genba/${pathParts[pathParts.length - 1]}`
  } catch (error) {
    console.error("URL解析エラー:", error)
    // エラーの場合はファイル名だけを返す
    const parts = url.split("/")
    return `public/genba/${parts[parts.length - 1]}`
  }
}
