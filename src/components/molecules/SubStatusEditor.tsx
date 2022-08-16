import type { FC } from "react"

import type { SubStatusID, SubStatusData } from "@/types/Scorer"
import { SubStatusMap } from "@/consts/Scorer"

import { SelectInput } from "@/components/molecules/SelectInput"

const SubStatusOption = {
  CRIT_RATE: "会心率",
  CRIT_DMG: "会心ダメージ",
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
const SUBSTAT_LIST = SubStatusOptionList.map(({ id, name }, i) => ({
  key: id + i,
  label: name,
  value: id,
}))

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
  onSelect: (id: SubStatusID) => void
  onChange: (value: number) => void
}

export const SubStatusEditor: FC<Props> = ({ sub, onSelect, onChange }) => {
  const isPer = sub.param.type === "percent"
  const step = isPer ? 0.1 : 1

  return (
    <div className="flex justify-between">
      <div className="flex gap-1 items-center font-black text-slate-700">
        <span className="whitespace-pre-wrap">{" ・"}</span>
        <SelectInput
          className="artifact-select-xs"
          defaultValue={sub.id}
          items={SUBSTAT_LIST}
          onSelect={onSelect}
        />
        <div className="flex items-center">
          <input
            type="number"
            inputMode="decimal"
            className="w-14 font-black artifact-value-input"
            min={0}
            step={step}
            value={sub.param.value}
            onChange={(e) => onChange(e.currentTarget.valueAsNumber)}
          />
          <span className="text-base sm:text-lg">{isPer ? "%" : ""}</span>
        </div>
      </div>
      <span className="hidden text-base text-slate-500 sm:inline sm:text-lg">
        ({getSubStatusRate(sub).toFixed()}%)
      </span>
    </div>
  )
}
