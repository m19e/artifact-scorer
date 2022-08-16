import { useMemo } from "react"
import type { FC } from "react"

import type { ArtifactTypeID, MainStatusID } from "@/types/Scorer"
import { ArtifactTypeMap } from "@/consts/Scorer"

import { SelectInput } from "@/components/molecules/SelectInput"

interface Props {
  type: ArtifactTypeID
  defaultValue: MainStatusID
  onSelect: (id: MainStatusID) => void
}

export const ArtifactMainSelect: FC<Props> = ({
  type,
  defaultValue,
  onSelect,
}) => {
  const ArtifactMainList = useMemo(
    () =>
      ArtifactTypeMap[type].main.map(({ id, name }, i) => ({
        key: id + i,
        label: name,
        value: id,
      })),
    [type]
  )

  return (
    <SelectInput
      className="text-white text-opacity-60 artifact-select-sm"
      defaultValue={defaultValue}
      items={ArtifactMainList}
      onSelect={onSelect}
    />
  )
}
