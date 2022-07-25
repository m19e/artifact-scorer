import type { FC } from "react"

import type { Artifact, CalcModeData, SubStatusBuildMap } from "@/types/Scorer"
import { DetailItem } from "@/components/molecules/ArtifactList/Item/Detail"

interface Props {
  filtered: Artifact[]
  calcMode: CalcModeData
  custom: SubStatusBuildMap
}

export const Detail: FC<Props> = ({ filtered, calcMode, custom }) => {
  return (
    <div className="flex flex-col gap-y-2 w-full">
      {filtered.map((artifact) => (
        <DetailItem
          key={artifact.id}
          artifact={artifact}
          calcMode={calcMode}
          custom={custom}
        />
      ))}
    </div>
  )
}
