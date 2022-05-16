import { useState } from "react"
import type { ChangeEventHandler } from "react"
import { createWorker } from "tesseract.js"
import type { ImageLike } from "tesseract.js"

interface Artifact {
  label: string
  option: string
  param: string
  paramType: "actual" | "percent"
  paramValue: number
}

const reg = new RegExp("[\u{2460}-\u{2468}]", "u")

const trimCircleFromNumber = (text: string): string => {
  return Array.from(text)
    .map((c) => {
      if (c.match(reg)) {
        return String(+(c.codePointAt(0)?.toString(16) ?? "0") - 2459)
      }
      return c
    })
    .join("")
}

const getArtifactType = () => {
  //
}

const getArtifactData = (text: string): Artifact => {
  const line = text.replace(/\s/g, "")
  const [opt, prm] = line.split("+")
  const option = opt.replace("カ", "力")
  const param = trimCircleFromNumber(prm)
  const label = option + "+" + param
  const isPercent = param.includes("%")
  const paramType: Artifact["paramType"] = isPercent ? "percent" : "actual"
  const paramValue = +param.split("%").join("")
  return { label, option, param, paramType, paramValue }
}

const getArtifactScore = (datas: Artifact[]): number => {
  return datas
    .map(({ paramType, option, paramValue }) => {
      const isPercent = paramType === "percent"
      if (isPercent && (option.includes("攻") || option.includes("会心"))) {
        if (option.includes("率")) {
          return paramValue * 2
        }
        return paramValue
      }
      return 0
    })
    .reduce((sum, elem) => sum + elem, 0)
}

const App = () => {
  const [file, setFile] = useState<ImageLike>("")
  const [url, setUrl] = useState("")
  const [textOcr, setTextOcr] = useState<string>("")
  const [progress, setProgress] = useState(0)
  const [artifacts, setArtifacts] = useState<Artifact[]>([])
  const [score, setScore] = useState(0)
  const worker = createWorker({
    logger: (m: { status: string; progress: number }) => {
      setProgress(Math.round(m.progress * 100))
      setTextOcr(m.status)
    },
  })

  const tryOcr = async () => {
    await worker.load()
    await worker.loadLanguage("jpn")

    await worker.initialize("jpn")
    await worker.setParameters({
      tessedit_char_whitelist:
        "会心率ダメ攻撃元素チャ効率HP防御熟知力カージ+.0①②③④⑤⑥⑦⑧⑨%",
    })
    const {
      data: { text },
    } = await worker.recognize(file)

    const datas: Artifact[] = text
      .split("\n")
      .filter((l) => Boolean(l))
      .map(getArtifactData)
    const newScore = getArtifactScore(datas)
    setArtifacts(datas)
    setScore(newScore)

    await worker.terminate()
  }

  const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    if (!e.target.files) {
      return
    }
    setUrl(URL.createObjectURL(e.target.files[0]))
    setFile(e.target.files[0])
  }

  const handleClick = async () => {
    if (!file) return
    setTextOcr("Recognizing...")
    await tryOcr()
  }

  return (
    <div className="flex flex-col gap-4 items-center p-8">
      <input type="file" onChange={handleChange} />
      {!!url && <img src={url} />}
      <button className="btn" onClick={handleClick}>
        Try OCR
      </button>
      <span>
        {textOcr} ({progress}%)
      </span>
      <progress className="w-56 progress" value={progress} max={100}></progress>
      <span className="whitespace-pre-wrap">
        {JSON.stringify(
          artifacts.map((a) => a.label),
          //   artifacts,
          null,
          4
        )}
      </span>
      <h1>SCORE: {Math.round(score * 10) / 10}</h1>
    </div>
  )
}

export default App
