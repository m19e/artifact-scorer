import type { FC } from "react"

import type { ArtifactSetID } from "@/types/Scorer"
import { ArtifactSetList } from "@/consts/Scorer"

interface Props {
  defaultValue: ArtifactSetID
  onSelect: (id: ArtifactSetID) => void
}

export const ArtifactSetSelect: FC<Props> = ({ defaultValue, onSelect }) => {
  return (
    <select
      className="text-white artifact-select-lg"
      defaultValue={defaultValue}
      onChange={(e) => onSelect(e.currentTarget.value as ArtifactSetID)}
    >
      {ArtifactSetList.map(({ id, name }) => (
        <option key={id} value={id}>
          {name}
        </option>
      ))}
    </select>
  )
}
