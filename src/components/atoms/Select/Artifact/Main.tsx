import type { FC } from "react"

import type { ArtifactTypeID, MainStatusID } from "@/types/Scorer"
import { ArtifactTypeMap } from "@/consts/Scorer"

interface Props {
  type: ArtifactTypeID
  onSelect: (id: MainStatusID) => void
}

export const ArtifactMainSelect: FC<Props> = ({ type, onSelect }) => {
  return (
    <select
      className="text-white text-opacity-60 artifact-select-sm"
      onChange={(e) => onSelect(e.currentTarget.value as MainStatusID)}
    >
      {ArtifactTypeMap[type].main.map((m, i) => (
        <option key={m.id + i} value={m.id}>
          {m.name}
        </option>
      ))}
    </select>
  )
}
