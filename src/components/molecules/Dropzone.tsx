import { useCallback } from "react"
import type { VFC } from "react"
import { useDropzone } from "react-dropzone"

export interface Props {
  onDrop: (file: File) => void
}

export const Dropzone: VFC<Props> = ({ onDrop }) => {
  const handleDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (!acceptedFiles.length) return
      onDrop(acceptedFiles[0])
    },
    [onDrop]
  )
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    accept: ["image/*"],
    maxFiles: 1,
  })

  return (
    <div
      {...getRootProps()}
      className="grid place-items-center p-2 mb-2 w-full max-w-sm h-40 card bg-base-200 rounded-box"
    >
      <div className="flex flex-col justify-center items-center w-full h-full text-sm font-black text-center border-2 border-dashed sm:text-base border-base-300 text-base-content rounded-box">
        <input {...getInputProps()} />
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
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        {isDragActive ? (
          <p>ここに画像をドロップ…</p>
        ) : (
          <>
            <p>{"画像ファイルをドロップ"}</p>
            <p className="text-sm text-black text-opacity-50">または</p>
            <p>クリックして選択</p>
          </>
        )}
      </div>
    </div>
  )
}

// <p>Drop the file here ...</p>
// <p>"Drag 'n' Drop image file here,"</p>
// <p>or click to select file</p>
