import { Fragment } from "react"
import type { FC } from "react"

interface Props {
  id: string
  onRemove: (id: string) => void
}

export const RemoveModal: FC<Props> = ({ id, onRemove }) => {
  const modalId = "modal-remove-" + id

  return (
    <Fragment>
      <input type="checkbox" id={modalId} className="modal-toggle" />
      <div className="modal">
        <div className="max-w-sm modal-box bg-base-200">
          <h3 className="text-lg font-bold">削除しますか？</h3>
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
                className="btn btn-sm btn-error sm:btn-md"
                onClick={() => onRemove(id)}
              >
                削除
              </label>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  )
}
