import type { FC } from "react"
import { useTheme } from "next-themes"

const THEMES = [
  // "light",
  "dark",
  // "cupcake",
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
  // "winter",
] as const

export const ThemeSelect: FC = () => {
  const { theme, setTheme } = useTheme()

  const handleChange: React.ChangeEventHandler<HTMLSelectElement> = (event) => {
    setTheme(event.target.value)
  }

  return (
    <div className="flex justify-center items-center">
      <select
        className="w-full max-w-xs select select-sm bg-neutral text-neutral-content select-bordered"
        defaultValue={theme}
        onChange={handleChange}
      >
        {THEMES.map((themeName) => (
          <option key={themeName}>{themeName}</option>
        ))}
      </select>
    </div>
  )
}
