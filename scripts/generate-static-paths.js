// このスクリプトはビルド前に実行して、静的に生成するパスを設定します
// package.jsonのビルドスクリプトに追加してください

const fs = require("fs")
const path = require("path")

// 静的に生成するパスのリスト
const staticPaths = [
  "/",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/dashboard",
  "/projects",
  "/staff",
  "/tools",
  "/shifts",
  "/leave",
  "/reports",
  "/profile",
  "/settings",
  // 他の静的に生成したいパスを追加
]

// app/ディレクトリ内の各ページに generateStaticParams 関数を追加
function addGenerateStaticParams() {
  const appDir = path.join(__dirname, "..", "app")

  // app/ディレクトリ内のすべてのページを検索
  function processDirectory(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)

      if (entry.isDirectory()) {
        // ディレクトリの場合は再帰的に処理
        processDirectory(fullPath)
      } else if (entry.name === "page.tsx" || entry.name === "page.js") {
        // ページファイルを見つけた場合
        console.log(`Processing: ${fullPath}`)

        // ファイルの内容を読み込む
        let content = fs.readFileSync(fullPath, "utf8")

        // すでに generateStaticParams 関数がある場合はスキップ
        if (content.includes("generateStaticParams")) {
          console.log(`  Already has generateStaticParams, skipping`)
          continue
        }

        // 関数を追加
        const functionToAdd = `
// 静的生成のためのパラメータを生成
export function generateStaticParams() {
  return []
}
`

        // ファイルの先頭に関数を追加
        content = functionToAdd + content

        // ファイルに書き戻す
        fs.writeFileSync(fullPath, content, "utf8")
        console.log(`  Added generateStaticParams to ${fullPath}`)
      }
    }
  }

  processDirectory(appDir)
}

// 実行
console.log("Generating static paths configuration...")
addGenerateStaticParams()
console.log("Done!")
