import "../styles/globals.css"

import type { AppProps } from "next/app"

// TODO update daisyUI themes
function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}

export default MyApp
