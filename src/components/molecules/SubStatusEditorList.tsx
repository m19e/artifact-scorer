import type { FC } from "react"

import type { SubStatusData } from "@/types/Scorer"
import { updateSubStatusByID } from "@/tools/Scorer"

import { SubStatusEditor } from "./SubStatusEditor"

interface Props {
  subs: SubStatusData[]
  updater: (index: number, newSub: SubStatusData) => void
}

export const SubStatusEditorList: FC<Props> = ({ subs, updater }) => {
  return (
    <div className="flex flex-col">
      {subs.map((sub, index) => {
        return (
          <SubStatusEditor
            key={sub.id + index}
            sub={sub}
            onSelect={(id) => {
              const newSub = updateSubStatusByID({ id, src: sub })
              updater(index, newSub)
            }}
            onChange={(value) => {
              const newSub = { ...sub, param: { ...sub.param, value } }
              updater(index, newSub)
            }}
          />
        )
      })}
    </div>
  )
}
