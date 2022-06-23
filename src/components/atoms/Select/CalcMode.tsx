import type { FC } from "react"

import type { CalcModeID } from "@/types/Scorer"
import { CalcModeList } from "@/consts/Scorer"

interface Props {
  onSelect: (id: CalcModeID) => void
}

export const CalcModeSelect: FC<Props> = ({ onSelect }) => {
  return (
    <select
      className="w-full select select-bordered"
      onChange={(e) => onSelect(e.currentTarget.value as CalcModeID)}
    >
      {CalcModeList.map((data) => (
        <option key={data.id} value={data.id}>
          {data.label}
        </option>
      ))}
    </select>
  )
}
