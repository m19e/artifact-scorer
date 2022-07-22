import { Fragment } from "react"
import type { FC } from "react"

import type {
  SetValue,
  Artifact,
  CalcModeData,
  SubStatusBuildMap,
} from "@/types/Scorer"
import { EditModal } from "@/components/molecules/ArtifactEditModal"
import { RemoveModal } from "@/components/atoms/ArtifactRemoveModal"
import { ArtifactDropdown } from "@/components/atoms/ArtifactDropdown"

interface Props {
  artifacts: Artifact[]
  calcMode: CalcModeData
  custom: SubStatusBuildMap
  onUpdate: SetValue<Artifact[]>
}

export const StoredArtifactList: FC<Props> = ({
  artifacts,
  calcMode,
  custom,
  onUpdate,
}) => {
  const handleRemove = (targetId: string) => {
    onUpdate((prev) => prev.filter((a) => a.id !== targetId))
  }
  const handleEdit = (newArt: Artifact) => {
    onUpdate((prev) => prev.map((a) => (a.id === newArt.id ? newArt : a)))
  }

  return (
    <>
      <div className="grid grid-cols-5 gap-2.5 sm:grid-cols-6">
        {artifacts.map((art) => (
          <ArtifactDropdown
            key={"dropdown-" + art.id}
            artifact={art}
            calcMode={calcMode}
            custom={custom}
          />
        ))}
      </div>
      {artifacts.map((art) => (
        <Fragment key={"modals-" + art.id}>
          <RemoveModal id={art.id} onRemove={handleRemove} />
          <EditModal artifact={art} onEdit={handleEdit} />
        </Fragment>
      ))}
    </>
  )
}
