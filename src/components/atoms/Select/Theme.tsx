import type { FC } from "react"
import { useTheme } from "next-themes"

// TODO filter themes
const THEMES = [
  "light",
  "dark",
  "cupcake",
  "bumblebee",
  "emerald",
  "corporate",
  "synthwave",
  "retro",
  "cyberpunk",
  "valentine",
  "halloween",
  "garden",
  "forest",
  "aqua",
  "lofi",
  "pastel",
  "fantasy",
  "wireframe",
  "black",
  "luxury",
  "dracula",
  "cmyk",
  "autumn",
  "business",
  "acid",
  "lemonade",
  "night",
  "coffee",
  "winter",
] as const

type ThemeID = typeof THEMES[number]

export const ThemeSelect: FC = () => {
  const { theme, setTheme } = useTheme()

  return (
    <div className="dropdown dropdown-end">
      <div tabIndex={0} className="gap-1 normal-case btn btn-ghost">
        <svg
          width="20"
          height="20"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          className="inline-block w-5 h-5 stroke-current md:w-6 md:h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
          ></path>
        </svg>
        <span className="hidden md:inline">Theme</span>
        <svg
          width="12px"
          height="12px"
          className="hidden ml-1 w-3 h-3 opacity-60 fill-current sm:inline-block"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 2048 2048"
        >
          <path d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z"></path>
        </svg>
      </div>
      <div
        tabIndex={0}
        className="overflow-y-auto top-px mt-16 w-52 h-[70vh] max-h-96 shadow-2xl dropdown-content bg-base-200 text-base-content rounded-t-box rounded-b-box"
      >
        <div className="grid grid-cols-1 gap-3 p-3">
          {THEMES.map((th) => {
            const isSelected = th === theme

            return (
              <ThemeListItem
                key={th}
                theme={th}
                isSelected={isSelected}
                onSelect={setTheme}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}

interface ItemProps {
  theme: ThemeID
  onSelect: (t: ThemeID) => void
  isSelected: boolean
}

const ThemeListItem: FC<ItemProps> = ({ theme, onSelect, isSelected }) => {
  const selected = isSelected ? " outline" : ""

  return (
    <div
      className={
        "overflow-hidden rounded-lg outline-2 outline-offset-2 outline-base-content" +
        selected
      }
      onClick={() => onSelect(theme)}
    >
      <div
        data-theme={theme}
        className="w-full font-sans cursor-pointer bg-base-100 text-base-content"
      >
        <div className="grid grid-cols-5 grid-rows-3">
          <div className="flex col-span-5 row-span-3 row-start-1 gap-1 py-3 px-4">
            <div className="flex-grow text-sm font-bold">{theme}</div>
            <div className="flex flex-wrap flex-shrink-0 gap-1">
              <div className="w-2 rounded bg-primary"></div>
              <div className="w-2 rounded bg-secondary"></div>
              <div className="w-2 rounded bg-accent"></div>
              <div className="w-2 rounded bg-neutral"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
