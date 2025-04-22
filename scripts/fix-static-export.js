const fs = require("fs")
const path = require("path")

// 静的エクスポート後の修正を行う関数
function fixStaticExport() {
  console.log("Starting static export fixes...")
  const outDir = path.join(process.cwd(), "out")

  // outディレクトリが存在するか確認
  if (!fs.existsSync(outDir)) {
    console.error("Error: 'out' directory does not exist. Build may have failed.")
    process.exit(1)
  }

  try {
    // .next/serverディレクトリを作成
    const nextServerDir = path.join(outDir, ".next", "server")
    if (!fs.existsSync(nextServerDir)) {
      fs.mkdirSync(nextServerDir, { recursive: true })
      console.log("Created .next/server directory")
    }

    // middleware-manifest.jsonを作成
    const middlewareManifest = {
      middleware: {},
      functions: {},
      version: 1,
    }
    fs.writeFileSync(path.join(nextServerDir, "middleware-manifest.json"), JSON.stringify(middlewareManifest, null, 2))
    console.log("Created middleware-manifest.json")

    // required-server-files.jsonを作成
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

    // index.htmlがない場合は作成
    const indexHtmlPath = path.join(outDir, "index.html")
    if (!fs.existsSync(indexHtmlPath)) {
      const indexHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta http-equiv="refresh" content="0;url=/login/" />
  <title>Redirecting to Login</title>
</head>
<body>
  <p>Redirecting to <a href="/login/">login page</a>...</p>
  <script>
    window.location.href = "/login/";
  </script>
</body>
</html>
      `
      fs.writeFileSync(indexHtmlPath, indexHtml.trim())
      console.log("Created index.html")
    }

    // 404.htmlがない場合は作成
    const notFoundHtmlPath = path.join(outDir, "404.html")
    if (!fs.existsSync(notFoundHtmlPath)) {
      const notFoundHtml = `
<!DOCTYPE html>
<html>
<head>
  <title>Page Not Found</title>
</head>
<body>
  <h1>404 - Page Not Found</h1>
  <p>The page you are looking for does not exist.</p>
  <p><a href="/login/">Go to login page</a></p>
</body>
</html>
      `
      fs.writeFileSync(notFoundHtmlPath, notFoundHtml.trim())
      console.log("Created 404.html")
    }

    // _next ディレクトリの確認
    const nextDir = path.join(outDir, "_next")
    if (!fs.existsSync(nextDir)) {
      console.warn("Warning: _next directory does not exist. This may cause issues.")
    } else {
      console.log("_next directory exists")
    }

    console.log("Static export fixed successfully!")
  } catch (error) {
    console.error("Error fixing static export:", error)
    process.exit(1)
  }
}

// 実行
fixStaticExport()
