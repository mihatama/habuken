const fs = require("fs")
const path = require("path")

// ビルド後に必要なサーバーファイルを作成する関数
function createRequiredServerFiles() {
  console.log("Preparing static export files...")
  const outDir = path.join(process.cwd(), "out")

  // outディレクトリが存在するか確認
  if (!fs.existsSync(outDir)) {
    console.error("Error: 'out' directory does not exist. Build may have failed.")
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

    fs.writeFileSync(path.join(nextServerDir, "middleware-manifest.json"), JSON.stringify(middlewareManifest, null, 2))
    console.log("Created middleware-manifest.json")

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
    console.log("Created required-server-files.json")

    // prerender-manifest.json を作成
    const prerenderManifest = {
      version: 4,
      routes: {},
      dynamicRoutes: {},
      notFoundRoutes: [],
    }

    fs.writeFileSync(path.join(outDir, ".next", "prerender-manifest.json"), JSON.stringify(prerenderManifest, null, 2))
    console.log("Created prerender-manifest.json")

    console.log("Created all required server files for static export")
  } catch (error) {
    console.error("Error creating required server files:", error)
  }
}

// 実行
createRequiredServerFiles()
