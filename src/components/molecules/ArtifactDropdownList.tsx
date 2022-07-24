import { useState } from "react"
import type { FC } from "react"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"
import type { DropResult } from "react-beautiful-dnd"

import type {
  Artifact,
  CalcModeData,
  SubStatusBuildMap,
  SetValue,
} from "@/types/Scorer"
import { ArtTypeIcon } from "@/components/atoms/ArtifactTypeIcons"

const reorder = (list: any[], startIndex: number, endIndex: number) => {
  const result = Array.from(list)
  const [removed] = result.splice(startIndex, 1)
  result.splice(endIndex, 0, removed)

  return result
}

interface Props {
  artifacts: Artifact[]
  calcMode: CalcModeData
  custom: SubStatusBuildMap
  onUpdate: SetValue<Artifact[]>
}

export const ArtifactDropdownList: FC<Props> = ({
  artifacts,
  calcMode,
  custom,
  onUpdate,
}) => {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragEnd = (result: DropResult) => {
    setIsDragging(false)
    if (!result.destination) {
      return
    }
    const newArts = reorder(
      artifacts,
      result.source.index,
      result.destination.index
    )

    onUpdate(newArts)
  }

  const mb = isDragging ? "mb-14" : "mb-0"

  return (
    <DragDropContext
      onDragStart={() => setIsDragging(true)}
      onDragEnd={handleDragEnd}
    >
      <Droppable droppableId="artifacts">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={`flex flex-col gap-y-2 w-full ${mb}`}
          >
            {artifacts.map((art, index) => (
              <Draggable key={art.id} draggableId={art.id} index={index}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <div className="flex items-center w-full bg-base-100">
                      <div className="p-0 w-14 h-14 shadow btn btn-sm btn-ghost bg-base-100 text-neutral-focus">
                        <ArtTypeIcon name={art.type.name} />
                      </div>
                      <div className="grid grid-rows-2 h-full">
                        <span>row 1</span>
                        <span>row 2</span>
                      </div>
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  )
}
