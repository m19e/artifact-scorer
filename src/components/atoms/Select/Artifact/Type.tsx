import type { FC } from "react"

import type { ArtifactTypeID } from "@/types/Scorer"
import { ArtifactTypeList } from "@/consts/Scorer"

import { SelectInput } from "@/components/molecules/SelectInput"

interface Props {
  defaultValue: ArtifactTypeID
  onSelect: (id: ArtifactTypeID) => void
}

const ARTTYPE_LIST = ArtifactTypeList.map(({ id, name }) => ({
  label: name,
  value: id,
}))

export const ArtifactTypeSelect: FC<Props> = ({ defaultValue, onSelect }) => {
  return (
    <SelectInput
      className="text-white text-opacity-90 artifact-select-sm"
      items={ARTTYPE_LIST}
      onSelect={onSelect}
      defaultValue={defaultValue}
    />
  )
}
