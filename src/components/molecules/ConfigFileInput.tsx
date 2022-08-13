import { useCallback } from "react"
import type { FC } from "react"
import { useDropzone } from "react-dropzone"

import type { Artifact, SetValue } from "@/types/Scorer"

interface Props {
  onDrop: SetValue<Artifact[]>
}

export const ConfigFileInput: FC<Props> = ({ onDrop }) => {
  const handleDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!acceptedFiles.length) return
      const [file] = acceptedFiles
      const text = await file.text()
      const data = JSON.parse(text) as Artifact[]
      onDrop(data)
    },
    [onDrop]
  )
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: handleDrop,
    accept: ["application/json"],
    maxFiles: 1,
    noDrag: true,
  })

  return (
    <div {...getRootProps()} className="w-full">
      <input {...getInputProps()} />
      <div className="flex gap-3">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-6 h-6 text-info"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
          />
        </svg>
        <span>インポート</span>
      </div>
    </div>
  )
}
