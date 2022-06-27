import { Fragment } from "react"
import type { FC } from "react"

import type { Artifact } from "@/types/Scorer"
import { useArtifact } from "@/hooks/Scorer"

import { ArtifactEditor } from "@/components/molecules/ArtifactEditor"

interface Props {
  artifact: Artifact
  onEdit: (newArt: Artifact) => void
}

export const EditModal: FC<Props> = ({ artifact, onEdit }) => {
  const [states, actions] = useArtifact(artifact)
  const modalId = "modal-edit-" + artifact.id

  return (
    <Fragment>
      <input type="checkbox" id={modalId} className="modal-toggle" />
      <div className="modal">
        <div className="flex flex-col items-center max-w-md bg-base-200 modal-box">
          <div className="w-full max-w-sm">
            <h3 className="text-lg font-bold">聖遺物の編集</h3>
            <div className="mt-1">
              <ArtifactEditor {...states} {...actions} />
            </div>
            <div className="flex justify-between">
              <div className="modal-action">
                <label
                  htmlFor={modalId}
                  className="btn btn-outline btn-sm sm:btn-md"
                >
                  キャンセル
                </label>
              </div>
              <div className="modal-action">
                <label
                  htmlFor={modalId}
                  className="btn btn-sm btn-info sm:btn-md"
                  onClick={() => onEdit(states.artifact)}
                >
                  保存
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  )
}
