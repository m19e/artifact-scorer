import { useState } from "react"
import { createWorker } from "tesseract.js"
import type { ImageLike } from "tesseract.js"

import { Dropzone } from "@/components/molecules/Dropzone"

interface Artifact {
  level: number
  main: {
    label: string
    status: string
    type: "actual" | "percent"
    value: number
  }
  subs: SubStatus[]
}

const SubStatusType = {
  HP_ACT: "hp_act",
  DEF_ACT: "def_act",
  ATK_ACT: "atk_act",
  HP_PER: "hp_per",
  DEF_PER: "def_per",
  ATK_PER: "atk_per",
  ELEMENTAL_MASTERY: "elemental_mastery",
  ENERGY_RECHARGE: "energy_recharge",
  CRIT_RATE: "crit_rate",
  CRIT_DAMAGE: "crit_damage",
  UNDETECTED: "undetected",
} as const

type SubStatusType = typeof SubStatusType[keyof typeof SubStatusType]

interface SubStatus {
  label: string
  type: SubStatusType
  status: string
  param: {
    label: string
    type: "actual" | "percent"
    value: number
  }
}

const getSubStatusType = (
  status: string,
  isPercent: boolean
): SubStatusType => {
  if (isPercent) {
    if (status.includes("HP")) return SubStatusType.HP_PER
    if (status.includes("防")) return SubStatusType.DEF_PER
    if (status.includes("攻")) return SubStatusType.ATK_PER
    if (status.includes("チャージ")) return SubStatusType.ENERGY_RECHARGE
    if (status.includes("率")) return SubStatusType.CRIT_RATE
    if (status.includes("ダメージ")) return SubStatusType.CRIT_DAMAGE
  }
  if (status.includes("HP")) return SubStatusType.HP_ACT
  if (status.includes("防")) return SubStatusType.DEF_ACT
  if (status.includes("攻")) return SubStatusType.ATK_ACT
  if (status.includes("熟知")) return SubStatusType.ELEMENTAL_MASTERY

  return SubStatusType.UNDETECTED
}

const reg = new RegExp("[\u{2460}-\u{2468}]", "u")

const trimCircleFromNumber = (text: string): string => {
  return Array.from(text)
    .map((c) => {
      if (c.match(reg)) {
        return String(+c.codePointAt(0)!.toString(16) - 2459)
      }
      return c
    })
    .join("")
}

const getSubStatusData = (line: string): SubStatus => {
  const [s, p] = line.split("+")
  const isPercent = p.includes("%")
  const status = s.replace("カ", "力")
  const type = getSubStatusType(status, isPercent)
  const paramLabel = trimCircleFromNumber(p)
  const label = status + "+" + paramLabel
  const paramType = isPercent ? "percent" : "actual"
  const paramValue = +paramLabel.split("%").join("")
  const param: SubStatus["param"] = {
    label: paramLabel,
    type: paramType,
    value: paramValue,
  }

  return {
    label,
    type,
    status,
    param,
  }
}

const getSubStatusDatas = (text: string): SubStatus[] => {
  return text
    .split("\n")
    .filter((l) => Boolean(l))
    .map((l) => getSubStatusData(l.replace(/\s/g, "")))
}

const getArtifactScore = (datas: SubStatus[]): number => {
  return datas
    .map(({ type, param }) => {
      switch (type) {
        case SubStatusType.CRIT_RATE:
          return param.value * 2

        case SubStatusType.CRIT_DAMAGE:
          return param.value

        case SubStatusType.ATK_PER:
          return param.value

        default:
          return 0
      }
    })
    .reduce((sum, elem) => sum + elem, 0)
}

const App = () => {
  const [file, setFile] = useState<ImageLike>("")
  const [url, setUrl] = useState("")
  const [textOcr, setTextOcr] = useState<string>("")
  const [progress, setProgress] = useState(0)
  const [substats, setSubStats] = useState<SubStatus[]>([])
  const [score, setScore] = useState(0)
  const worker = createWorker({
    logger: (m: { status: string; progress: number }) => {
      setProgress(Math.round(m.progress * 100))
      // setTextOcr(m.status)
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

    const datas = getSubStatusDatas(text)
    const newScore = getArtifactScore(datas)
    setSubStats(datas)
    setScore(newScore)

    await worker.terminate()
  }

  const handleDrop = (file: File) => {
    setUrl(URL.createObjectURL(file))
    setFile(file)
  }

  const handleClick = async () => {
    if (!file) return
    setTextOcr("Recognizing...")
    await tryOcr()
  }

  return (
    <div className="flex flex-col gap-4 items-center p-8">
      <Dropzone onDrop={handleDrop} />
      {!!url && <img src={url} />}
      <button className="btn" onClick={handleClick}>
        Try OCR
      </button>
      <span>
        {textOcr} ({progress}%)
      </span>
      <progress className="w-56 progress" value={progress} max={100}></progress>
      <div className="shadow stats">
        <div className="text-center stat">
          <div className="stat-title">ARTIFACT SCORE</div>
          <div className="stat-value text-primary">
            {Math.round(score * 10) / 10} (
            {Math.round(((score * 10) / 60.3) * 100) / 10}%)
          </div>
          <div className="stat-desc">Critical Rate/Damage TYPE</div>
        </div>
      </div>
      <span className="whitespace-pre-wrap">
        {JSON.stringify(
          substats.map((s) => s.label),
          null,
          4
        )}
      </span>
    </div>
  )
}

export default App
