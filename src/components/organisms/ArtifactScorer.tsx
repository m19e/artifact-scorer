import { Fragment, useState, useCallback } from "react"
import { createWorker } from "tesseract.js"
import type { ImageLike, Rectangle } from "tesseract.js"
import { useLocalStorage } from "@/hooks/useLocalStorage"

import type { Artifact, ArtifactTypeID, ArtifactSetID } from "@/types/Scorer"
import { ArtifactTypeList, ArtifactSet } from "@/consts/Scorer"
import { getSubStatusDatas } from "@/tools/Scorer"
import { useArtifact } from "@/hooks/Scorer"

import { ImageLoader } from "@/components/molecules/ImageLoader"
import { ArtifactEditor } from "@/components/molecules/ArtifactEditor"
import { StoredArtifactList } from "@/components/molecules/StoredArtifactList"

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
  const [filterArtType, setFilterArtType] = useState<"ALL" | ArtifactTypeID>(
    "ALL"
  )
  const [filterArtSet, setFilterArtSet] = useState<"ALL" | ArtifactSetID>("ALL")

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

  const allType = filterArtType === "ALL"
  const allSet = filterArtSet == "ALL"
  const filteredArts =
    allType && allSet
      ? storedArts
      : storedArts.filter((art) => {
          const validType = art.type.id === filterArtType
          const validSet = art.set.id === filterArtSet
          return (
            (allType && validSet) ||
            (allSet && validType) ||
            (validType && validSet)
          )
        })

  return (
    <Fragment>
      <div className="flex flex-col my-4 w-11/12 max-w-sm sm:w-full">
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
          <div className="grid grid-cols-2 gap-2 mb-2">
            <select
              className="select select-sm"
              onChange={(e) =>
                setFilterArtType(e.currentTarget.value as ArtifactTypeID)
              }
            >
              <option value="ALL">全種類</option>
              {ArtifactTypeList.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
            <select
              className="select select-sm"
              onChange={(e) =>
                setFilterArtSet(e.currentTarget.value as ArtifactSetID)
              }
            >
              <option value="ALL">全セット</option>
              {Array.from(new Set(storedArts.map(({ set }) => set.id))).map(
                (id) => (
                  <option key={id} value={id}>
                    {ArtifactSet[id]}
                  </option>
                )
              )}
            </select>
          </div>
          <div className="grid grid-cols-6 gap-2.5 justify-between">
            <StoredArtifactList
              artifacts={filteredArts}
              calcMode={calcMode}
              onUpdate={setStoredArts}
            />
          </div>
        </div>
      </div>
    </Fragment>
  )
}
