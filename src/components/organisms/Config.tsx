import { useState, useCallback } from "react"

import { useLocalStorage } from "@/hooks/useLocalStorage"

import type { Artifact } from "@/types/Scorer"

import { ConfigFileInput } from "@/components/molecules/ConfigFileInput"

const getTimestamp = () => {
  const dt = new Date()
  const y = String(dt.getFullYear()).slice(-2)
  const m = ("00" + String(dt.getMonth() + 1)).slice(-2)
  const d = ("00" + String(dt.getDate())).slice(-2)

  return y + m + d
}

const downloadURI = (uri: string, name: string) => {
  const link = document.createElement("a")
  link.download = name
  link.href = uri
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export const Config = () => {
  const [storedArts, setStoredArts] = useLocalStorage<Artifact[]>(
    "artifacts",
    []
  )
  const [imported, setImported] = useState<Artifact[]>([])
  const resetImported = () => setImported([])

  const handleImport = useCallback(() => {
    if (!imported.length) return
    setStoredArts(imported)
    resetImported()
  }, [imported])
  const handleExport = useCallback(() => {
    const data = new Blob([JSON.stringify(storedArts)], { type: "text/json" })
    const uri = URL.createObjectURL(data)
    const fileName = `artifact-scorer-${getTimestamp()}.json`
    downloadURI(uri, fileName)
  }, [storedArts])

  const importId = "modal-import"
  const clearId = "modal-clear"

  return (
    <>
      <div className="dropdown dropdown-end">
        <label tabIndex={0} className="btn btn-square">
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
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </label>
        <ul
          tabIndex={0}
          className="mt-4 w-48 font-semibold shadow dropdown-content menu bg-base-100 rounded-box text-base-content"
        >
          <li className="hover:bordered">
            <div className="py-3 px-4">
              <label htmlFor={importId} className="w-full">
                <ConfigFileInput onDrop={setImported} />
              </label>
            </div>
          </li>
          <li className="hover:bordered" onClick={handleExport}>
            <div className="flex">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6 text-success"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              <span>エクスポート</span>
            </div>
          </li>
          <li className="hover:bordered">
            <label htmlFor={clearId}>
              <div className="flex gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6 text-error"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                <span>データ削除</span>
              </div>
            </label>
          </li>
        </ul>
      </div>

      <input type="checkbox" id={importId} className="modal-toggle" />
      <div className="modal">
        <div className="max-w-sm modal-box text-base-content">
          <h3 className="text-lg font-bold">インポートしますか？</h3>
          <p className="py-4">※現在の聖遺物は上書きされます</p>
          <div className="flex justify-between">
            <div className="modal-action">
              <label
                htmlFor={importId}
                className="btn btn-outline btn-sm sm:btn-md"
                onClick={resetImported}
              >
                キャンセル
              </label>
            </div>
            <div className="modal-action">
              <label
                htmlFor={importId}
                className="btn btn-sm btn-primary sm:btn-md"
                onClick={handleImport}
              >
                インポート
              </label>
            </div>
          </div>
        </div>
      </div>
      <input type="checkbox" id={clearId} className="modal-toggle" />
      <div className="modal">
        <div className="max-w-sm modal-box text-base-content">
          <h3 className="text-lg font-bold">全聖遺物を削除しますか？</h3>
          <div className="flex justify-between">
            <div className="modal-action">
              <label
                htmlFor={clearId}
                className="btn btn-outline btn-sm sm:btn-md"
              >
                キャンセル
              </label>
            </div>
            <div className="modal-action">
              <label
                htmlFor={clearId}
                className="btn btn-sm btn-error sm:btn-md"
                onClick={() => setStoredArts([])}
              >
                削除
              </label>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
