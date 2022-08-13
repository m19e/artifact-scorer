import type { FC } from "react"

import type { CalcModeID } from "@/types/Scorer"
import { CalcModeList } from "@/consts/Scorer"

interface Props {
  onSelect: (id: CalcModeID) => void
}

export const CalcModeSelect: FC<Props> = ({ onSelect }) => {
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
