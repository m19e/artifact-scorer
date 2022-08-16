import type { FC } from "react"

import type { ArtifactSetID } from "@/types/Scorer"
import { ArtifactSetList } from "@/consts/Scorer"

import { SelectInput } from "@/components/molecules/SelectInput"

interface Props {
  defaultValue: ArtifactSetID
  onSelect: (id: ArtifactSetID) => void
}

const ARTSET_LIST = [...ArtifactSetList]
  .reverse()
  .map(({ id, name }) => ({ label: name, value: id }))

export const ArtifactSetSelect: FC<Props> = ({ defaultValue, onSelect }) => {
  return (
    <SelectInput
      className="text-white artifact-select-lg"
      items={ARTSET_LIST}
      onSelect={onSelect}
      defaultValue={defaultValue}
    />
  )
}
