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
    <div className="grid grid-cols-1 gap-y-2 p-4 border border-opacity-20 sm:grid-cols-2 bg-base-100 border-base-content rounded-box">
      {Object.values(custom).map(({ id, name, value }) => (
        <div key={id} className="flex justify-between">
          <span className="font-normal">{name}</span>
          <div>
            <span className="-mr-0.5">×</span>
            <input
              type="number"
              inputMode="decimal"
              className="pl-0.5 w-12 h-5 text-base font-black leading-3 input input-xs"
              min={0}
              max={2}
              step={0.1}
              value={value}
              onChange={(e) => {
                const value = e.currentTarget.valueAsNumber
                setCustom((prev) => {
                  const newSub = { ...prev[id], value }
                  const newCustom = { ...prev, [id]: newSub }
                  return newCustom
                })
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
