const fs = require("fs")
const path = require("path")

// ビルド後に必要なサーバーファイルを作成する関数
function createRequiredServerFiles() {
  console.log("Preparing static export files...")
  const outDir = path.join(process.cwd(), "out")

  // outディレクトリが存在するか確認
  if (!fs.existsSync(outDir)) {
    console.error("Error: 'out' directory does not exist. Build may have failed.")
    process.exit(1) // エラーで終了して問題を明確にする
    return
  }

  try {
    // .next/server ディレクトリが存在しない場合は作成
    const nextServerDir = path.join(outDir, ".next", "server")
    if (!fs.existsSync(nextServerDir)) {
      fs.mkdirSync(nextServerDir, { recursive: true })
      console.log("Created .next/server directory")
    }

    // middleware-manifest.json を作成
    const middlewareManifest = {
      middleware: {},
      functions: {},
      version: 1,
    }

    const middlewareManifestPath = path.join(nextServerDir, "middleware-manifest.json")
    fs.writeFileSync(middlewareManifestPath, JSON.stringify(middlewareManifest, null, 2))
    console.log(`Created middleware-manifest.json at ${middlewareManifestPath}`)

    // required-server-files.json を作成
    const requiredServerFiles = {
      config: {
        configFile: "next.config.js",
        trailingSlash: true,
        output: "export",
      },
      pages: {},
    }

    const requiredServerFilesPath = path.join(outDir, "required-server-files.json")
    fs.writeFileSync(requiredServerFilesPath, JSON.stringify(requiredServerFiles, null, 2))
    console.log(`Created required-server-files.json at ${requiredServerFilesPath}`)

    // ファイルが実際に作成されたか確認
    if (fs.existsSync(requiredServerFilesPath)) {
      console.log("Verified required-server-files.json exists")
    } else {
      console.error("ERROR: Failed to create required-server-files.json")
      process.exit(1)
    }

    console.log("Created all required server files for static export")
  } catch (error) {
    console.error("Error creating required server files:", error)
    process.exit(1) // エラーで終了して問題を明確にする
  }
}

// 実行
createRequiredServerFiles()
