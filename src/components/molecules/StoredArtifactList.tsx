import type { FC } from "react"

import type { SetValue, Artifact, CalcModeData } from "@/types/Scorer"
import { EditModal } from "@/components/molecules/ArtifactEditModal"
import { RemoveModal } from "@/components/atoms/ArtifactRemoveModal"
import { ArtifactDropdown } from "@/components/atoms/ArtifactDropdown"

interface Props {
  artifacts: Artifact[]
  calcMode: CalcModeData
  onUpdate: SetValue<Artifact[]>
}

export const StoredArtifactList: FC<Props> = ({
  artifacts,
  calcMode,
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
      {artifacts.map((art) => (
        <ArtifactDropdown key={art.id} artifact={art} calcMode={calcMode} />
      ))}
      {artifacts.map((art) => (
        <>
          <RemoveModal key={art.id} id={art.id} onRemove={handleRemove} />
          <EditModal key={art.id} artifact={art} onEdit={handleEdit} />
        </>
      ))}
    </>
  )
}
