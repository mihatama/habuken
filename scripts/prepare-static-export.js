const fs = require("fs")
const path = require("path")

// ビルド後に必要なサーバーファイルを作成する関数
function createRequiredServerFiles() {
  const outDir = path.join(process.cwd(), "out")
  const nextServerDir = path.join(outDir, ".next", "server")

  // .next/server ディレクトリが存在しない場合は作成
  if (!fs.existsSync(nextServerDir)) {
    fs.mkdirSync(nextServerDir, { recursive: true })
  }

  // middleware-manifest.json を作成
  const middlewareManifest = {
    middleware: { "/": {} },
    functions: {},
    version: 1,
  }

  fs.writeFileSync(path.join(nextServerDir, "middleware-manifest.json"), JSON.stringify(middlewareManifest, null, 2))

  // required-server-files.json を作成
  const requiredServerFiles = {
    config: {
      configFile: "next.config.js",
      trailingSlash: true,
      output: "export",
    },
    pages: {},
  }

  fs.writeFileSync(path.join(outDir, "required-server-files.json"), JSON.stringify(requiredServerFiles, null, 2))

  console.log("Created required server files for static export")
}

// 実行
createRequiredServerFiles()
