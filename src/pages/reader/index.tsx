import { Fragment, useState, useCallback } from "react"
import { createWorker } from "tesseract.js"
import type { ImageLike, Rectangle } from "tesseract.js"
import { useLocalStorage } from "@/hooks/useLocalStorage"

import type { Artifact } from "@/types/Scorer"
import { MainStatusMap } from "@/consts/Scorer"
import { getSubStatusDatas, updateSubStatusByID } from "@/tools/Scorer"
import { useArtifact } from "@/hooks/Scorer"

import { ImageLoader } from "@/components/molecules/ImageLoader"
import { SubStatusEditor } from "@/components/molecules/SubStatusEditor"
import { Header } from "@/components/atoms/Header"
import { Footer } from "@/components/atoms/Footer"
import { CalcModeSelect } from "@/components/atoms/Select/CalcMode"
import { ArtifactSetSelect } from "@/components/atoms/Select/Artifact/Set"
import { ArtifactTypeSelect } from "@/components/atoms/Select/Artifact/Type"
import { ArtifactMainSelect } from "@/components/atoms/Select/Artifact/Main"
import { RarityRating } from "@/components/atoms/RarityRating"
import { ArtifactScoreBox } from "@/components/atoms/ArtifactScoreBox"
import { TwitterShareButton } from "@/components/atoms/TwitterShareButton"
import { ArtifactDropdown } from "@/components/atoms/ArtifactDropdown"
import { RemoveModal } from "@/components/atoms/ArtifactRemoveModal"

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

  const { artSetID, artTypeID, mainType, substats, artifact, calcMode, score } =
    states

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
          <div className="flex flex-col">
            <div className="mb-2">
              <CalcModeSelect onSelect={actions.setCalcType} />
            </div>
            <div className="h-12 artifact-heading">
              <div className="mt-1.5 ml-6">
                <ArtifactSetSelect
                  defaultValue={artSetID}
                  onSelect={actions.setArtSetID}
                />
              </div>
            </div>
            <div className="h-44 artifact-hero">
              <div className="flex justify-between h-full">
                <div className="flex flex-col justify-between ml-6">
                  <div className="mt-1">
                    <ArtifactTypeSelect onSelect={actions.setArtTypeID} />
                  </div>
                  <div className="flex flex-col">
                    <div className="-ml-0.5">
                      <ArtifactMainSelect
                        type={artTypeID}
                        onSelect={actions.setMainType}
                      />
                    </div>
                    <span className="font-mono text-4xl leading-7 text-white">
                      {MainStatusMap[mainType].max}
                    </span>
                    <div className="my-2.5">
                      <RarityRating />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col justify-center mr-4">
                  <ArtifactScoreBox score={score} calc={calcMode.name} />
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2 py-3 bg-orange-100">
              <div className="flex justify-between items-center px-4">
                <div className="pr-1 pl-0.5 h-6 bg-slate-700 rounded">
                  <span className="text-xl font-black leading-5 text-white">
                    +20
                  </span>
                </div>
                <TwitterShareButton artifact={artifact} calcMode={calcMode} />
              </div>
              <div className="flex flex-col pr-4 pl-3.5">
                {substats.map((s, index) => (
                  <SubStatusEditor
                    key={s.id + index}
                    sub={s}
                    onSelectID={(id) => {
                      const data = updateSubStatusByID({ id, src: s })
                      actions.setSubStats((prev) =>
                        prev.map((sub, i) => (index === i ? data : sub))
                      )
                    }}
                    onChangeValue={(value) => {
                      actions.setSubStats((prev) =>
                        prev.map((sub, i) => {
                          if (index === i) {
                            const param = { ...sub.param, value }
                            return { ...sub, param }
                          }
                          return sub
                        })
                      )
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
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
          onRemove={() =>
            setStoredArts((prev) => prev.filter((a) => a.id !== targetId))
          }
        />
      ))}
    </Fragment>
  )
}

export default App
