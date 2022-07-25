import type { FC } from "react"

import type { Artifact, CalcModeData, SubStatusBuildMap } from "@/types/Scorer"
import { ArtifactDropdown } from "@/components/atoms/ArtifactDropdown"

interface Props {
  filtered: Artifact[]
  calcMode: CalcModeData
  custom: SubStatusBuildMap
}

export const Grid: FC<Props> = ({ filtered, calcMode, custom }) => {
  return (
    <div className="flex flex-col items-center">
      <div className="grid grid-cols-5 gap-x-2.5 gap-y-1.5 sm:grid-cols-6">
        {filtered.map((artifact) => (
          <ArtifactDropdown
            key={"dropdown-" + artifact.id}
            artifact={artifact}
            calcMode={calcMode}
            custom={custom}
          />
        ))}
      </div>
    </div>
  )
}
