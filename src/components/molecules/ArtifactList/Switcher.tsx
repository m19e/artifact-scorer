import type { FC } from "react"

import type {
  SetValue,
  Artifact,
  CalcModeData,
  SubStatusBuildMap,
  ArtifactListMode,
} from "@/types/Scorer"

import { Sortable } from "@/components/molecules/ArtifactList/Sortable"
import { Grid } from "@/components/molecules/ArtifactList/Grid"
import { Detail } from "@/components/molecules/ArtifactList/Detail"
import { ListEmpty } from "@/components/molecules/ArtifactList/Empty"

interface Props {
  mode: ArtifactListMode
  filtered: Artifact[]
  artifacts: Artifact[]
  calcMode: CalcModeData
  custom: SubStatusBuildMap
  onUpdate: SetValue<Artifact[]>
}

const Switcher: FC<Props> = ({
  mode,
  filtered,
  artifacts,
  calcMode,
  custom,
  onUpdate,
}) => {
  if (!filtered.length) {
    return <ListEmpty />
  }
  if (mode === "sort") {
    return <Sortable artifacts={artifacts} onUpdate={onUpdate} />
  }
  if (mode === "grid") {
    return <Grid filtered={filtered} calcMode={calcMode} custom={custom} />
  }

  return <Detail filtered={filtered} calcMode={calcMode} custom={custom} />
}

export default Switcher
