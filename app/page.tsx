export default function Home() {
  // 静的エクスポートでは動的リダイレクトが機能しないため、
  // クライアントサイドでリダイレクトを行うHTMLを返す
  return (
    <html>
      <head>
        <meta httpEquiv="refresh" content="0;url=/login/" />
        <title>Redirecting to Login</title>
      </head>
      <body>
        <p>
          Redirecting to <a href="/login/">login page</a>...
        </p>
        <script
          dangerouslySetInnerHTML={{
            __html: `
            window.location.href = "/login/";
          `,
          }}
        />
      </body>
    </html>
  )
}
