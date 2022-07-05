import type { FC } from "react"

import type { ArtifactState, ArtifactAction } from "@/hooks/Scorer"

type Props = Pick<ArtifactState, "calcMode" | "custom"> &
  Pick<ArtifactAction, "setCustom">

export const CustomBuildEditor: FC<Props> = ({
  calcMode,
  custom,
  setCustom,
}) => {
  if (calcMode.id !== "CUSTOM") return null

  return (
    <div className="mb-2">
      <div className="grid grid-cols-1 gap-2 p-4 border border-opacity-20 sm:grid-cols-2 bg-base-100 border-base-content rounded-box">
        {Object.values(custom).map((sub) => (
          <div key={sub.id} className="flex justify-between">
            <span className="font-normal">{sub.name}</span>
            <input
              type="number"
              inputMode="decimal"
              className="px-0 w-12 h-5 text-base font-black leading-3 text-slate-700 input input-xs"
              min={0}
              max={2}
              step={0.1}
              value={sub.value}
              onChange={(e) => {
                const value = e.currentTarget.valueAsNumber
                setCustom((prev) => {
                  const newSub = { ...prev[sub.id], value }
                  const newCustom = { ...prev, [sub.id]: newSub }
                  return newCustom
                })
              }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
