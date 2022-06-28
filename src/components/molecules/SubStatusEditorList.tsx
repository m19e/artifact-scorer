import type { FC } from "react"

import type { SubStatusData } from "@/types/Scorer"
import { updateSubStatusByID } from "@/tools/Scorer"

import { SubStatusEditor } from "./SubStatusEditor"

interface Props {
  subs: SubStatusData[]
  onUpdate: (index: number, newSub: SubStatusData) => void
}

export const SubStatusEditorList: FC<Props> = ({ subs, onUpdate }) => {
  return (
    <div className="flex flex-col">
      {subs.map((sub, index) => {
        return (
          <SubStatusEditor
            key={sub.id + index}
            sub={sub}
            onSelect={(id) => {
              const newSub = updateSubStatusByID({ id, src: sub })
              onUpdate(index, newSub)
            }}
            onChange={(value) => {
              const newSub = { ...sub, param: { ...sub.param, value } }
              onUpdate(index, newSub)
            }}
          />
        )
      })}
    </div>
  )
}
