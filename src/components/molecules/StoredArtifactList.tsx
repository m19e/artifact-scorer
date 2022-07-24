import { useState, Fragment } from "react"
import type { FC } from "react"

import type {
  SetValue,
  Artifact,
  CalcModeData,
  SubStatusBuildMap,
} from "@/types/Scorer"
import { ArtifactDropdownList } from "@/components/molecules/ArtifactDropdownList"
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
  const [isSort, setIsSort] = useState(false)

  const handleRemove = (targetId: string) => {
    onUpdate((prev) => prev.filter((a) => a.id !== targetId))
  }
  const handleEdit = (newArt: Artifact) => {
    onUpdate((prev) => prev.map((a) => (a.id === newArt.id ? newArt : a)))
  }

  return (
    <div className="flex flex-col gap-2 items-center">
      <label className="pr-2 pl-3.5 w-full h-8 font-bold cursor-pointer label rounded-box bg-base-100">
        <span className="label-text">並べ替え</span>
        <input
          type="checkbox"
          className="checkbox"
          checked={isSort}
          onChange={(e) => setIsSort(e.target.checked)}
        />
      </label>
      {isSort ? (
        <ArtifactDropdownList
          artifacts={artifacts}
          calcMode={calcMode}
          custom={custom}
          onUpdate={onUpdate}
        />
      ) : (
        <div className="grid grid-cols-5 gap-x-2.5 gap-y-1.5 sm:grid-cols-6">
          {artifacts.map((art) => (
            <ArtifactDropdown
              key={"dropdown-" + art.id}
              artifact={art}
              calcMode={calcMode}
              custom={custom}
            />
          ))}
        </div>
      )}
      {artifacts.map((art) => (
        <Fragment key={"modals-" + art.id}>
          <RemoveModal id={art.id} onRemove={handleRemove} />
          <EditModal artifact={art} onEdit={handleEdit} />
        </Fragment>
      ))}
    </div>
  )
}
