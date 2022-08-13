import "../styles/globals.css"

import type { AppProps } from "next/app"
import { ThemeProvider } from "next-themes"

// TODO update daisyUI themes
function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider defaultTheme="retro">
      <Component {...pageProps} />
    </ThemeProvider>
  )
}

export default MyApp
