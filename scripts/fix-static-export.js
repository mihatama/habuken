const fs = require("fs")
const path = require("path")

// 静的エクスポート後の修正を行う関数
function fixStaticExport() {
  const outDir = path.join(process.cwd(), "out")

  // .next/serverディレクトリを作成
  const nextServerDir = path.join(outDir, ".next", "server")
  if (!fs.existsSync(nextServerDir)) {
    fs.mkdirSync(nextServerDir, { recursive: true })
  }

  // middleware-manifest.jsonを作成
  const middlewareManifest = {
    middleware: {},
    functions: {},
    version: 1,
  }
  fs.writeFileSync(path.join(nextServerDir, "middleware-manifest.json"), JSON.stringify(middlewareManifest, null, 2))

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
  }

  console.log("Static export fixed successfully!")
}

// 実行
fixStaticExport()
