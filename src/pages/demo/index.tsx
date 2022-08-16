
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

const Demo = () => {
  return (
    <main className="flex flex-col justify-center items-center p-4 h-screen bg-base-100">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 rounded-box">
        {THEMES.map((theme) => (
          <div
            key={theme}
            className="overflow-hidden rounded-lg border outline-2 outline-offset-2 border-base-content/20 hover:border-base-content/40 outline-base-content"
          >
            <div
              data-theme={theme}
              className="w-full font-sans cursor-pointer bg-base-100 text-base-content"
            >
              <div className="grid grid-cols-5 grid-rows-3">
                <div className="col-start-1 row-span-2 row-start-1 bg-base-200"></div>
                <div className="col-start-1 row-start-3 bg-base-300"></div>
                <div className="flex flex-col col-span-4 col-start-2 row-span-3 row-start-1 gap-1 p-2 bg-base-100">
                  <div className="font-bold">{theme}</div>
                  <div className="flex flex-wrap gap-1">
                    <div className="aspect-square flex justify-center items-center w-5 rounded lg:w-6 bg-primary">
                      <div className="text-sm font-bold text-primary-content">
                        A
                      </div>
                    </div>
                    <div className="aspect-square flex justify-center items-center w-5 rounded lg:w-6 bg-secondary">
                      <div className="text-sm font-bold text-secondary-content">
                        A
                      </div>
                    </div>
                    <div className="aspect-square flex justify-center items-center w-5 rounded lg:w-6 bg-accent">
                      <div className="text-sm font-bold text-accent-content">
                        A
                      </div>
                    </div>
                    <div className="aspect-square flex justify-center items-center w-5 rounded lg:w-6 bg-neutral">
                      <div className="text-sm font-bold text-neutral-content">
                        A
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}

export default Demo
