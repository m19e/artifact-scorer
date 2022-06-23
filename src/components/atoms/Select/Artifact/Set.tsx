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
      className="pl-0 h-8 min-h-0 text-3xl font-bold leading-7 text-white bg-opacity-0 select select-ghost"
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
