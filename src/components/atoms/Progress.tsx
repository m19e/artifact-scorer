import type { VFC } from "react"

interface Props {
  label: string
  progress: number
}

export const Progress: VFC<Props> = ({ label, progress }) => {
  return (
    <div className="flex flex-col items-center py-2 px-4 rounded shadow bg-base-100">
      <div className="h-6">
        {label !== "" ? (
          <span className="text-base-content">
            {label} ({progress}%)
          </span>
        ) : (
          <span className="text-base-content">Progress</span>
        )}
      </div>
      <progress className="w-56 progress" value={progress} max={100}></progress>
    </div>
  )
}
