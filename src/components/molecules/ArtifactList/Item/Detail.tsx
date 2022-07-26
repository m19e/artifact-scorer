import type { FC } from "react"

import type { Artifact, CalcModeData, SubStatusBuildMap } from "@/types/Scorer"
import { ArtTypeIcon } from "@/components/atoms/ArtifactTypeIcons"
import { TwitterShareIcon } from "@/components/atoms/TwitterShareButton"

interface Props {
  artifact: Artifact
  calcMode: CalcModeData
  custom: SubStatusBuildMap
}

export const DetailItem: FC<Props> = ({ artifact, calcMode, custom }) => {
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
        className="flex overflow-hidden gap-1 items-center px-1 w-full shadow bg-base-100 rounded-box"
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
}
