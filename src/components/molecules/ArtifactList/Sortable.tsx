import { useState } from "react"
import type { FC } from "react"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"
import type { DropResult } from "react-beautiful-dnd"

import type { Artifact, SetValue } from "@/types/Scorer"
import { ArtTypeIcon } from "@/components/atoms/ArtifactTypeIcons"

const reorder = (list: any[], startIndex: number, endIndex: number) => {
  const result = Array.from(list)
  const [removed] = result.splice(startIndex, 1)
  result.splice(endIndex, 0, removed)

  return result
}

interface Props {
  artifacts: Artifact[]
  onUpdate: SetValue<Artifact[]>
}

export const Sortable: FC<Props> = ({ artifacts, onUpdate }) => {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragEnd = (result: DropResult) => {
    setIsDragging(false)
    if (!result.destination) {
      return
    }

    const { source, destination } = result
    onUpdate((prev) => reorder(prev, source.index, destination.index))
  }

  const mb = isDragging ? "mb-20" : "mb-0"

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
            {artifacts.map(({ id, type, set, main, subs }, index) => (
              <Draggable key={id} draggableId={id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <div className="flex overflow-hidden gap-1 items-center px-1 w-full bg-base-100 rounded-box">
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
                              <span
                                key={sub.id + i}
                                className="leading-4 sm:leading-5"
                              >
                                {name}+{param.value}
                                {per}
                              </span>
                            )
                          })}
                        </div>
                      </div>

                      <div className="flex flex-col justify-center text-neutral-focus">
                        {snapshot.isDragging ? (
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
                              d="M8 9l4-4 4 4m0 6l-4 4-4-4"
                            />
                          </svg>
                        ) : (
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
                              d="M4 6h16M4 12h16M4 18h16"
                            />
                          </svg>
                        )}
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
