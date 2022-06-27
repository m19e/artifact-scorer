import { Fragment, useState, useCallback } from "react"
import { createWorker } from "tesseract.js"
import type { ImageLike, Rectangle } from "tesseract.js"
import { useLocalStorage } from "@/hooks/useLocalStorage"

import type { Artifact } from "@/types/Scorer"
import { getSubStatusDatas } from "@/tools/Scorer"
import { useArtifact } from "@/hooks/Scorer"

import { ImageLoader } from "@/components/molecules/ImageLoader"

import { Header } from "@/components/atoms/Header"
import { Footer } from "@/components/atoms/Footer"
import { ArtifactEditor } from "@/components/molecules/ArtifactEditor"
import { ArtifactDropdown } from "@/components/atoms/ArtifactDropdown"
import { RemoveModal } from "@/components/atoms/ArtifactRemoveModal"
import { EditModal } from "@/components/molecules/ArtifactEditModal"

const App = () => {
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

  const { artifact, calcMode } = states

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
  const saveArt = useCallback(() => {
    const id = Date.now().toString(16)
    setStoredArts((prev) => [{ ...artifact, id }, ...prev])
  }, [artifact, setStoredArts])
  const removeArt = (id: string) => {
    setStoredArts((prev) => prev.filter((a) => a.id !== id))
  }
  const editArt = (id: string, newArt: Artifact) => {
    setStoredArts((prev) => prev.map((a) => (a.id === id ? newArt : a)))
  }

  return (
    <Fragment>
      <div className="flex flex-col items-center min-h-screen bg-base-200">
        <Header />
        <div className="flex flex-col flex-1 my-4 max-w-sm">
          <ImageLoader
            url={url}
            onDrop={handleDrop}
            onCrop={setRectangle}
            onReset={() => setUrl("")}
          />
          <div className="my-2">
            <div className="divider">
              {inOCRProcess ? (
                <button className="btn btn-primary loading">読取中</button>
              ) : (
                <button
                  className="btn btn-primary"
                  disabled={!url}
                  onClick={handleRecognize}
                >
                  読取
                </button>
              )}
            </div>
          </div>
          <ArtifactEditor {...states} {...actions} />
          <div className="flex flex-col">
            <div className="my-2">
              <div className="divider">
                <button
                  className="btn btn-secondary"
                  disabled={!url}
                  onClick={saveArt}
                >
                  保存
                </button>
              </div>
            </div>
            <div className="grid grid-cols-6 gap-2.5 justify-between">
              {storedArts.map((art) => (
                <ArtifactDropdown
                  key={art.id}
                  artifact={art}
                  calcMode={calcMode}
                />
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
      {storedArts.map(({ id: targetId }) => (
        <RemoveModal
          key={targetId}
          id={targetId}
          onRemove={() => removeArt(targetId)}
        />
      ))}
      {storedArts.map((art) => (
        <EditModal
          key={art.id}
          artifact={art}
          onEdit={(newArt) =>
            editArt(art.id, newArt)
          }
        />
      ))}
    </Fragment>
  )
}

export default App
