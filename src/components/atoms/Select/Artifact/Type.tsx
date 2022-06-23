import type { FC } from "react"

import type { ArtifactTypeID } from "@/types/Scorer"
import { ArtifactTypeList } from "@/consts/Scorer"

interface Props {
  onSelect: (id: ArtifactTypeID) => void
}

export const ArtifactTypeSelect: FC<Props> = ({ onSelect }) => {
  return (
    <select
      className="pl-0 w-24 h-6 min-h-0 text-base leading-5 text-white bg-opacity-0 select select-sm select-ghost text-opacity-80"
      onChange={(e) => onSelect(e.currentTarget.value as ArtifactTypeID)}
    >
      {ArtifactTypeList.map((a) => (
        <option key={a.name} value={a.id}>
          {a.name}
        </option>
      ))}
    </select>
  )
}
