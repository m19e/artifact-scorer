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

const App = () => {
  const [file, setFile] = useState<ImageLike>("")
  const [url, setUrl] = useState("")
  const [textOcr, setTextOcr] = useState<string>("")
  const [artifacts, setArtifacts] = useState<Artifact[]>([])
  const [score, setScore] = useState(0)
  const worker = createWorker({
    logger: (m) => console.log(m),
  })

  const tryOcr = async () => {
    await worker.load()
    await worker.loadLanguage("jpn+eng")

    await worker.initialize("eng")
    await worker.setParameters({
      tessedit_char_whitelist:
        // "会心率ダメージ攻撃力元素チャージ効率HP防御力熟知+.0123465789①②③④⑤⑥⑦⑧⑨%",
        "+.0123465789%",
    })
    const {
      data: { text: parameters },
    } = await worker.recognize(file)
    const fmtParams = parameters
      .split("\n")
      .filter((l) => !!l)
      .map((line) => line.split("+").slice(-1).join(""))

    await worker.initialize("jpn")
    await worker.setParameters({
      tessedit_char_whitelist:
        "会心率ダメージ攻撃力元素チャージ効率HP防御力熟知+.①②③④⑤⑥⑦⑧⑨%",
    })
    const {
      data: { text: options },
    } = await worker.recognize(file)
    const fmtOpts = options
      .split("\n")
      .filter((l) => !!l)
      .map((line) => line.split("+")[0])

    const zipped: Artifact[] = fmtOpts.map((opt, i) => {
      const option = opt.replace(/\s/g, "")
      const param = fmtParams[i].replace(/\s/g, "")
      const label = option + "+" + param

      const isPercent = param.includes("%")
      const paramType: Artifact["paramType"] = isPercent ? "percent" : "actual"
      const paramValue = +param.split("%").join("")
      if (isPercent && (option.includes("攻") || option.includes("会心"))) {
        if (option.includes("率")) {
          setScore((prev) => prev + paramValue * 2)
        } else {
          setScore((prev) => prev + paramValue)
        }
      }
      return { label, option, param, paramType, paramValue }
    })
    setArtifacts(zipped)

    await worker.terminate()
  }

  // fileData 取得
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
    <div className="flex flex-col items-center">
      <input type="file" onChange={handleChange} />
      {!!url && <img src={url} />}
      <button className="button" onClick={handleClick}>
        Try OCR
      </button>
      <span className="whitespace-pre-wrap">
        {JSON.stringify(
          artifacts.map((a) => a.label),
          null,
          4
        )}
      </span>
      <h1>SCORE: {Math.round(score * 10) / 10}</h1>
    </div>
  )
}

export default App
