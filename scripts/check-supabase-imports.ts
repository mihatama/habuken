/**
 * このスクリプトは、プロジェクト内のファイルをスキャンして、
 * 削除された非推奨Supabaseファイルへの参照を検出します。
 */

import fs from "fs"
import path from "path"
import { promisify } from "util"

const readdir = promisify(fs.readdir)
const readFile = promisify(fs.readFile)
const stat = promisify(fs.stat)

// 削除された非推奨ファイルのパターン
const deprecatedPatterns = [
  'lib/supabase"',
  "lib/supabase'",
  'lib/supabase-client"',
  "lib/supabase-client'",
  "lib/supabase/",
]

// 除外するディレクトリ
const excludeDirs = ["node_modules", ".next", "out", "build", "dist", ".git"]

// ファイルをスキャンする関数
async function scanFile(filePath: string): Promise<string[]> {
  try {
    const content = await readFile(filePath, "utf8")
    const issues: string[] = []

    // 各行をチェック
    const lines = content.split("\n")
    lines.forEach((line, index) => {
      // インポート文を検索
      if (line.includes("import") || line.includes("require")) {
        for (const pattern of deprecatedPatterns) {
          if (line.includes(pattern)) {
            issues.push(`${filePath}:${index + 1} - 非推奨インポート: ${line.trim()}`)
          }
        }
      }
    })

    return issues
  } catch (error) {
    console.error(`Error scanning file ${filePath}:`, error)
    return []
  }
}

// ディレクトリを再帰的にスキャンする関数
async function scanDir(dir: string): Promise<string[]> {
  const issues: string[] = []

  try {
    const files = await readdir(dir)

    for (const file of files) {
      const filePath = path.join(dir, file)
      const stats = await stat(filePath)

      // ディレクトリの場合は再帰的にスキャン
      if (stats.isDirectory()) {
        if (!excludeDirs.includes(file)) {
          const subIssues = await scanDir(filePath)
          issues.push(...subIssues)
        }
      }
      // ファイルの場合は内容をスキャン
      else if (
        stats.isFile() &&
        (file.endsWith(".ts") || file.endsWith(".tsx") || file.endsWith(".js") || file.endsWith(".jsx"))
      ) {
        const fileIssues = await scanFile(filePath)
        issues.push(...fileIssues)
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dir}:`, error)
  }

  return issues
}

// メイン関数
async function main() {
  console.log("非推奨Supabaseインポートのスキャンを開始します...")

  const issues = await scanDir(".")

  if (issues.length === 0) {
    console.log("問題は見つかりませんでした。すべてのファイルが新しいインポートを使用しています。")
  } else {
    console.log(`${issues.length}件の問題が見つかりました:`)
    issues.forEach((issue) => console.log(issue))
  }
}

// スクリプトを実行
main().catch((error) => {
  console.error("エラーが発生しました:", error)
  process.exit(1)
})
