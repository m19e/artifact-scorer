import type { VFC } from "react"

interface Props {
  label: string
  progress: number
}

export const Progress: VFC<Props> = ({ label, progress }) => {
  return (
    <div className="flex flex-col items-center py-2 px-4 rounded border bg-base-100 border-base-300">
      <div className="h-6">
        {label !== "" ? (
          <span className="text-base-content">
            {label} ({progress}%)
          </span>
        ) : (
          <span className="text-base-content">Progress</span>
        )}
      </div>
      <progress
        className="w-full progress"
        value={progress}
        max={100}
      ></progress>
    </div>
  )
}
