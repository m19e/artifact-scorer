import type { FC } from "react"

import type { SubStatusID, SubStatusData } from "@/types/Scorer"
import { SubStatusMap } from "@/consts/Scorer"

const SubStatusOption = {
  CRIT_RATE: "会心率",
  CRIT_DAMAGE: "会心ダメージ",
  ATK_PER: "攻撃力(%)",
  ENERGY_RECHARGE: "元素チャージ効率",
  DEF_PER: "防御力(%)",
  HP_PER: "HP(%)",
  ELEMENTAL_MASTERY: "元素熟知",
  HP_FLAT: "HP(実数)",
  DEF_FLAT: "防御力(実数)",
  ATK_FLAT: "攻撃力(実数)",
  UNDETECTED: "なし",
} as const
type SubStatusOptionData = {
  id: SubStatusID
  name: typeof SubStatusOption[SubStatusID]
}
const SubStatusOptionList: SubStatusOptionData[] = Object.entries(
  SubStatusOption
).map(([key, name]) => {
  const id = key as SubStatusID
  return { id, name }
})

const getSubStatusRate = (data: SubStatusData): number => {
  const {
    id,
    param: { value },
  } = data
  if (id === "UNDETECTED" || Number.isNaN(value) || value === 0) {
    return 0
  }
  const { max } = SubStatusMap[id]
  return Math.round((value / (max * 6)) * 100 * 10) / 10
}

interface Props {
  sub: SubStatusData
  onSelectID: (id: SubStatusID) => void
  onChangeValue: (value: number) => void
}

export const SubStatusEditor: FC<Props> = ({
  sub,
  onSelectID,
  onChangeValue,
}) => {
  const isPer = sub.param.type === "percent"
  const step = isPer ? 0.1 : 1

  return (
    <div className="flex justify-between">
      <div className="flex gap-1 items-center">
        <span className="font-black whitespace-pre-wrap">{" ・"}</span>
        <select
          className="text-slate-700 artifact-select-xs"
          defaultValue={sub.id}
          onChange={(e) => onSelectID(e.currentTarget.value as SubStatusID)}
        >
          {SubStatusOptionList.map((opt) => (
            <option key={opt.name} value={opt.id}>
              {opt.name}
            </option>
          ))}
        </select>
        <div className="inline-flex font-black">
          <input
            type="number"
            inputMode="decimal"
            className="px-0 w-14 text-lg font-black leading-4 text-slate-700 input input-xs input-ghost"
            min={0}
            step={step}
            value={sub.param.value}
            onChange={(e) => onChangeValue(e.currentTarget.valueAsNumber)}
          />
          <span>{isPer ? "%" : ""}</span>
        </div>
      </div>
      <span className="text-lg text-slate-500">
        ({getSubStatusRate(sub).toFixed()}%)
      </span>
    </div>
  )
}
