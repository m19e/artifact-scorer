import type { FC } from "react"

import type { CalcModeID } from "@/types/Scorer"
import { CalcModeList } from "@/consts/Scorer"

import { SelectInput } from "@/components/molecules/SelectInput"

const CALCMODE_LIST = CalcModeList.map(({ label, id }) => ({
  label,
  value: id,
}))

interface Props {
  onSelect: (id: CalcModeID) => void
}

export const CalcModeSelect: FC<Props> = ({ onSelect }) => {
  return (
    <SelectInput
      className="w-full select select-bordered rounded-box"
      items={CALCMODE_LIST}
      onSelect={onSelect}
      defaultValue={"CRIT"}
    />
  )
  return (
    <select
      className="w-full select select-bordered rounded-box"
      onChange={(e) => onSelect(e.currentTarget.value as CalcModeID)}
    >
      {CalcModeList.map(({ id, label }) => (
        <option key={id} value={id}>
          {label}
        </option>
      ))}
    </select>
  )
}
