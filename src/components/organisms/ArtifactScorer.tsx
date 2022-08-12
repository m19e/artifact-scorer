import { useState, useCallback } from "react"
import { createWorker } from "tesseract.js"
import type { ImageLike, Rectangle } from "tesseract.js"
import { useLocalStorage } from "@/hooks/useLocalStorage"

import type { Artifact } from "@/types/Scorer"
import { getSubStatusDatas } from "@/tools/Scorer"
import { useArtifact } from "@/hooks/Scorer"

import { ImageLoader } from "@/components/molecules/ImageLoader"
import { ArtifactEditor } from "@/components/molecules/ArtifactEditor"
import { Container as ArtifactListContainer } from "@/components/organisms/ArtifactListContainer"

export const ArtifactScorer = () => {
  const [file, setFile] = useState<ImageLike>("")
  const [url, setUrl] = useState("")
  const [rectangle, setRectangle] = useState<Rectangle>({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
  })
  const [inOCRProcess, setInOCRProcess] = useState(false)

  const [states, actions] = useArtifact()
  const [storedArts, setStoredArts] = useLocalStorage<Artifact[]>(
    "artifacts",
    []
  )

  const { artifact, calcMode, custom } = states

  const handleDrop = (f: File) => {
    setUrl(URL.createObjectURL(f))
    setFile(f)
  }
  const handleRecognize = useCallback(async () => {
    setInOCRProcess(true)

    const worker = createWorker({
      logger: (m: { status: string; progress: number }) => {
        //
      },
    })
    await worker.load()
    await worker.loadLanguage("jpn")

    await worker.initialize("jpn")
    await worker.setParameters({
      tessedit_char_whitelist:
        "会心率ダメ攻撃元素チャ効率HP防御熟知力カージ+.0①②③④⑤⑥⑦⑧⑨%",
    })
    const {
      data: { text },
    } = await worker.recognize(file, {
      rectangle,
    })
    await worker.terminate()

    const datas = getSubStatusDatas(text)
    actions.setSubStats(datas)

    setInOCRProcess(false)
  }, [file, rectangle, actions])
  const handleSave = useCallback(() => {
    const id = Date.now().toString(16)
    setStoredArts((prev) => [{ ...artifact, id }, ...prev])
  }, [artifact, setStoredArts])

  return (
    <div className="flex flex-col flex-1 gap-2 my-2 w-11/12 max-w-sm sm:w-full">
      <ImageLoader
        url={url}
        onDrop={handleDrop}
        onCrop={setRectangle}
        onReset={() => setUrl("")}
      />
      <div className="divider">
        {inOCRProcess ? (
          <button className="btn btn-primary rounded-box loading">
            読取中
          </button>
        ) : (
          <button
            className="btn btn-primary rounded-box"
            disabled={!url}
            onClick={handleRecognize}
          >
            読取
          </button>
        )}
      </div>
      <ArtifactEditor {...states} {...actions} />
      <div className="grid grid-cols-1 gap-2">
        <div className="divider">
          <button
            className="btn btn-secondary rounded-box"
            disabled={!url}
            onClick={handleSave}
          >
            保存
          </button>
        </div>
        <ArtifactListContainer
          artifacts={storedArts}
          calcMode={calcMode}
          custom={custom}
          onUpdate={setStoredArts}
        />
      </div>
    </div>
  )
}
