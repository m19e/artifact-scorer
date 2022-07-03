import { Html, Head, Main, NextScript } from "next/document"

export default function Document() {
  return (
    <Html data-theme="retro">
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@900&display=swap"
          rel="stylesheet"
        />
        <link href="https://fonts.cdnfonts.com/css/renner" rel="stylesheet" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
