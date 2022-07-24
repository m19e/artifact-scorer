import { useState, useMemo, Fragment } from "react"
import type { FC } from "react"

import { ArtifactTypeList, ArtifactSet } from "@/consts/Scorer"
import type {
  SetValue,
  Artifact,
  CalcModeData,
  SubStatusBuildMap,
  ArtifactTypeID,
  ArtifactSetID,
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
  const [filterArtType, setFilterArtType] = useState<"ALL" | ArtifactTypeID>(
    "ALL"
  )
  const [filterArtSet, setFilterArtSet] = useState<"ALL" | ArtifactSetID>("ALL")

  const filteredArts = useMemo(() => {
    const allType = filterArtType === "ALL"
    const allSet = filterArtSet == "ALL"

    if (allType && allSet) return artifacts

    return artifacts.filter((art) => {
      const validType = art.type.id === filterArtType
      const validSet = art.set.id === filterArtSet
      return (
        (allType && validSet) ||
        (allSet && validType) ||
        (validType && validSet)
      )
    })
  }, [filterArtType, filterArtSet, artifacts])

  const handleRemove = (targetId: string) => {
    onUpdate((prev) => prev.filter((a) => a.id !== targetId))
  }
  const handleEdit = (newArt: Artifact) => {
    onUpdate((prev) => prev.map((a) => (a.id === newArt.id ? newArt : a)))
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <select
          className="select select-sm"
          onChange={(e) =>
            setFilterArtType(e.currentTarget.value as ArtifactTypeID)
          }
        >
          <option value="ALL">全種類</option>
          {ArtifactTypeList.map((type) => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </select>
        <select
          className="select select-sm"
          onChange={(e) =>
            setFilterArtSet(e.currentTarget.value as ArtifactSetID)
          }
        >
          <option value="ALL">全セット</option>
          {Array.from(new Set(artifacts.map(({ set }) => set.id))).map((id) => (
            <option key={id} value={id}>
              {ArtifactSet[id]}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-2 items-center">
        <label className="pr-2 pl-3.5 w-full h-8 font-bold cursor-pointer label rounded-box bg-base-100">
          <span className="label-text">
            並べ替え{isSort ? "(ドラッグ&ドロップ)" : ""}
          </span>
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
            {filteredArts.map((art) => (
              <ArtifactDropdown
                key={"dropdown-" + art.id}
                artifact={art}
                calcMode={calcMode}
                custom={custom}
              />
            ))}
          </div>
        )}
        {filteredArts.map((art) => (
          <Fragment key={"modals-" + art.id}>
            <RemoveModal id={art.id} onRemove={handleRemove} />
            <EditModal artifact={art} onEdit={handleEdit} />
          </Fragment>
        ))}
      </div>
    </>
  )
}
