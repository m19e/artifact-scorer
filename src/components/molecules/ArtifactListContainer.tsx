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
import { SortableArtifactList } from "@/components/molecules/SortableArtifactList"
import { Grid } from "@/components/molecules/ArtifactList/Grid"
import { Detail } from "@/components/molecules/ArtifactList/Detail"
import { EditModal } from "@/components/molecules/ArtifactEditModal"
import { RemoveModal } from "@/components/atoms/ArtifactRemoveModal"

type ArtifactListMode = "sort" | "grid" | "detail"

interface Props {
  artifacts: Artifact[]
  calcMode: CalcModeData
  custom: SubStatusBuildMap
  onUpdate: SetValue<Artifact[]>
}

export const Container: FC<Props> = ({
  artifacts,
  calcMode,
  custom,
  onUpdate,
}) => {
  const [isGridView, setIsGridView] = useState(true)
  const [isSort, setIsSort] = useState(false)
  const [filterArtType, setFilterArtType] = useState<"ALL" | ArtifactTypeID>(
    "ALL"
  )
  const [filterArtSet, setFilterArtSet] = useState<"ALL" | ArtifactSetID>("ALL")

  const mode: ArtifactListMode = useMemo(() => {
    if (isSort) return "sort"
    if (isGridView) return "grid"
    return "detail"
  }, [isGridView, isSort])
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
    <div className="flex flex-col gap-2">
      <div className="flex gap-2 items-center">
        <div className="flex-1">
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
        </div>
        {!isSort && (
          <div className="btn btn-square btn-sm bg-base-100 text-neutral-focus btn-ghost">
            <label className="swap swap-rotate">
              <input
                type="checkbox"
                checked={isGridView}
                onChange={(e) => setIsGridView(e.target.checked)}
              />

              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="w-6 h-6 stroke-current swap-on"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>

              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6 stroke-current swap-off"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 10h16M4 14h16M4 18h16"
                />
              </svg>
            </label>
          </div>
        )}
      </div>
      {!isSort && (
        <div className="grid grid-cols-2 gap-2">
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
            {Array.from(new Set(artifacts.map(({ set }) => set.id))).map(
              (id) => (
                <option key={id} value={id}>
                  {ArtifactSet[id]}
                </option>
              )
            )}
          </select>
        </div>
      )}
      <Switcher
        mode={mode}
        filtered={filteredArts}
        artifacts={artifacts}
        calcMode={calcMode}
        custom={custom}
        onUpdate={onUpdate}
      />
      {filteredArts.map((art) => (
        <Fragment key={"modals-" + art.id}>
          <RemoveModal id={art.id} onRemove={handleRemove} />
          <EditModal artifact={art} onEdit={handleEdit} />
        </Fragment>
      ))}
    </div>
  )
}

interface SwitcherProps extends Props {
  mode: ArtifactListMode
  filtered: Artifact[]
}

const Switcher: FC<SwitcherProps> = ({
  mode,
  filtered,
  artifacts,
  calcMode,
  custom,
  onUpdate,
}) => {
  if (mode === "sort") {
    return <SortableArtifactList artifacts={artifacts} onUpdate={onUpdate} />
  }
  if (mode === "grid") {
    return <Grid filtered={filtered} calcMode={calcMode} custom={custom} />
  }

  return <Detail filtered={filtered} calcMode={calcMode} custom={custom} />
}
