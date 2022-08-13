import type { FC } from "react"

import type { ScorableArtifactProps } from "@/types/Scorer"
import { ArtTypeIcon } from "@/components/atoms/ArtifactTypeIcons"
import { TwitterShareIcon } from "@/components/atoms/TwitterShareButton"

export const GridItem: FC<ScorableArtifactProps> = ({
  artifact,
  calcMode,
  custom,
}) => {
  const { id, type, set, main, subs } = artifact
  const editId = "modal-edit-" + id
  const removeId = "modal-remove-" + id

  return (
    <div className="w-14 h-14 artifact-dropdown">
      <label
        tabIndex={0}
        className="p-0 w-full h-full shadow bg-base-100 btn btn-sm btn-ghost rounded-box"
      >
        <div className="text-base-focus">
          <ArtTypeIcon name={type.name} />
        </div>
      </label>
      <div
        tabIndex={0}
        className="flex flex-col p-3 min-w-max shadow dropdown-content bg-base-100 text-base-content rounded-box"
      >
        <div className="flex flex-col items-center text-base font-bold sm:text-xl">
          <div className="flex flex-col items-center sm:flex-row">
            <span>{set.name}</span>
            <span className="hidden whitespace-pre-wrap sm:inline">
              {" / "}
            </span>
            <span>{type.name}</span>
          </div>
          <div className="flex flex-col items-center sm:flex-row">
            <span>{main.name}</span>
            <span>+{main.max}</span>
          </div>
        </div>
        <div className="my-2 h-0 divider"></div>
        <div className="flex text-sm sm:text-lg">
          <div className="flex flex-col flex-1">
            {subs.map((sub, i) => (
              <span key={sub.id + i}>{sub.name}</span>
            ))}
          </div>
          <div className="flex flex-col">
            {subs.map((sub, i) => (
              <span key={sub.id + i}>
                +{sub.param.value}
                {sub.param.type === "percent" ? "%" : ""}
              </span>
            ))}
          </div>
        </div>
        <div className="my-2 h-0 divider"></div>
        <div className="flex justify-end">
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
            className="btn btn-sm btn-circle btn-ghost text-base-focus"
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
    </div>
  )
}
