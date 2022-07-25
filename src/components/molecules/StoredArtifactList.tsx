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
import { EditModal } from "@/components/molecules/ArtifactEditModal"
import { RemoveModal } from "@/components/atoms/ArtifactRemoveModal"
import { ArtTypeIcon } from "@/components/atoms/ArtifactTypeIcons"
import { TwitterShareIcon } from "@/components/atoms/TwitterShareButton"

type ArtifactListMode = "sort" | "grid" | "detail"

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
      <ArtifactListSwitcher
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

const ArtifactListSwitcher: FC<SwitcherProps> = ({
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
    return <Grid artifacts={filtered} calcMode={calcMode} custom={custom} />
  }

  return (
    <div className="flex flex-col gap-y-2 w-full">
      {filtered.map((artifact) => {
        const { id, type, set, main, subs } = artifact
        const editId = "modal-edit-" + id
        const removeId = "modal-remove-" + id

        return (
          <div
            key={id}
            className="cursor-pointer select-none dropdown dropdown-top dropdown-end"
          >
            <div
              tabIndex={0}
              className="flex overflow-hidden gap-1 items-center px-1 w-full bg-base-100 rounded-box"
            >
              <div className="p-0 w-10 h-10 bg-base-100 text-neutral-focus">
                <ArtTypeIcon name={type.name} />
              </div>
              <div className="flex flex-col flex-1 py-1 h-full">
                <div className="flex flex-wrap gap-x-1 text-sm font-bold leading-4 sm:text-base sm:leading-5">
                  <span>{set.name}</span>
                  <span>{type.name}</span>
                  <span>{main.name}</span>
                </div>
                <div className="m-1 mx-0 mb-1.5 h-0 divider"></div>
                <div className="flex flex-wrap gap-x-1 text-sm sm:text-base">
                  {subs.map((sub, i) => {
                    const { name, param } = sub
                    const per = param.type === "percent" ? "%" : ""
                    return (
                      <span key={sub.id + i} className="leading-4 sm:leading-5">
                        {name}+{param.value}
                        {per}
                      </span>
                    )
                  })}
                </div>
              </div>
            </div>
            <div
              tabIndex={0}
              className="flex justify-end px-1 -mb-8 shadow dropdown-content bg-base-100 rounded-box"
            >
              <label
                htmlFor={removeId}
                className="hover:bg-opacity-20 modal-button text-error text-opacity-75 hover:bg-error btn btn-sm btn-error btn-circle btn-ghost"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </label>
              <label
                htmlFor={editId}
                className="text-neutral-focus text-opacity-75 btn btn-sm btn-circle btn-ghost"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </label>
              <TwitterShareIcon
                artifact={artifact}
                calcMode={calcMode}
                custom={custom}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
