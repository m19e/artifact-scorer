import type { FC } from "react"

import type { ArtifactTypeID } from "@/types/Scorer"
import { ArtifactTypeList } from "@/consts/Scorer"

interface Props {
  onSelect: (id: ArtifactTypeID) => void
}

export const ArtifactTypeSelect: FC<Props> = ({ onSelect }) => {
  return (
    <select
      className="text-white text-opacity-90 artifact-select-sm"
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
