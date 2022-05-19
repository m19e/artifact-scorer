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

const CalcType = {
  CRIT: "会心率/ダメージ型（汎用火力用）",
  ENERGY_RECHARGE: "元素チャージ効率型（絶縁の旗印）",
  DEF: "防御型（華館夢醒形骸記）",
  HP: "HP型（鍾離/胡桃）",
  ELEMENTAL_MASTERY: "元素熟知型（翠緑の影）",
} as const

type CalcType = typeof CalcType[keyof typeof CalcType]

interface CalcTypeData {
  label: CalcType
  type: keyof typeof CalcType
  name: string
  description: string
}

const CalcTypeDataList: CalcTypeData[] = [
  {
    label: CalcType.CRIT,
    type: "CRIT",
    name: "会心率/ダメージ型",
    description: "汎用火力用",
  },
  {
    label: CalcType.ENERGY_RECHARGE,
    type: "ENERGY_RECHARGE",
    name: "元素チャージ効率型",
    description: "絶縁の旗印",
  },
  {
    label: CalcType.DEF,
    type: "DEF",
    name: "防御型",
    description: "華館夢醒形骸記",
  },
  {
    label: CalcType.HP,
    type: "HP",
    name: "HP型",
    description: "鍾離/胡桃",
  },
  {
    label: CalcType.ELEMENTAL_MASTERY,
    type: "ELEMENTAL_MASTERY",
    name: "元素熟知型",
    description: "翠緑の影",
  },
]

const CalcTypeMap: { [key in CalcTypeData["type"]]: CalcTypeData } = {
  CRIT: {
    label: CalcType.CRIT,
    type: "CRIT",
    name: "会心率/ダメージ型",
    description: "汎用火力用",
  },
  ENERGY_RECHARGE: {
    label: CalcType.ENERGY_RECHARGE,
    type: "ENERGY_RECHARGE",
    name: "元素チャージ効率型",
    description: "絶縁の旗印",
  },
  DEF: {
    label: CalcType.DEF,
    type: "DEF",
    name: "防御型",
    description: "華館夢醒形骸記",
  },
  HP: {
    label: CalcType.HP,
    type: "HP",
    name: "HP型",
    description: "鍾離/胡桃",
  },
  ELEMENTAL_MASTERY: {
    label: CalcType.ELEMENTAL_MASTERY,
    type: "ELEMENTAL_MASTERY",
    name: "元素熟知型",
    description: "翠緑の影",
  },
}

const SubStatusType = {
  HP_ACT: "HP_ACT",
  DEF_ACT: "DEF_ACT",
  ATK_ACT: "ATK_ACT",
  HP_PER: "HP_PER",
  DEF_PER: "DEF_PER",
  ATK_PER: "ATK_PER",
  ELEMENTAL_MASTERY: "ELEMENTAL_MASTERY",
  ENERGY_RECHARGE: "ENERGY_RECHARGE",
  CRIT_RATE: "CRIT_RATE",
  CRIT_DAMAGE: "CRIT_DAMAGE",
  UNDETECTED: "UNDETECTED",
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

const SubStatusMap: { [key in SubStatusType]: { max: number } } = {
  HP_ACT: { max: 299 },
  DEF_ACT: { max: 23 },
  ATK_ACT: { max: 19 },
  HP_PER: { max: 5.8 },
  DEF_PER: { max: 7.3 },
  ATK_PER: { max: 5.8 },
  ELEMENTAL_MASTERY: { max: 23 },
  ENERGY_RECHARGE: { max: 6.5 },
  CRIT_RATE: { max: 3.9 },
  CRIT_DAMAGE: { max: 7.8 },
  UNDETECTED: { max: 0 },
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

const getArtifactScore = (
  datas: SubStatus[],
  calcType: CalcTypeData["type"]
): number => {
  return datas
    .map(({ type, param }) => {
      switch (type) {
        case SubStatusType.CRIT_RATE:
          return param.value * 2

        case SubStatusType.CRIT_DAMAGE:
          return param.value

        case SubStatusType.ATK_PER:
          if (calcType === "CRIT") {
            return param.value
          }
          return 0

        case SubStatusType.ENERGY_RECHARGE:
          if (calcType === "ENERGY_RECHARGE") {
            return param.value
          }
          return 0

        case SubStatusType.DEF_PER:
          if (calcType === "DEF") {
            return param.value
          }
          return 0

        case SubStatusType.HP_PER:
          if (calcType === "HP") {
            return param.value
          }
          return 0

        case SubStatusType.ELEMENTAL_MASTERY:
          if (calcType === "ELEMENTAL_MASTERY") {
            return param.value / 2
          }
          return 0

        default:
          return 0
      }
    })
    .reduce((sum, elem) => sum + elem, 0)
}

const getSubStatusRate = (data: SubStatus): number => {
  const {
    type,
    param: { value },
  } = data
  const { max } = SubStatusMap[type]
  return Math.round((value / (max * 6)) * 100 * 10) / 10
}

const App = () => {
  const [file, setFile] = useState<ImageLike>("")
  const [url, setUrl] = useState("")
  const [textOcr, setTextOcr] = useState<string>("")
  const [progress, setProgress] = useState(0)
  const [substats, setSubStats] = useState<SubStatus[]>([])
  const [score, setScore] = useState(0)
  const [calcType, setCalcType] = useState<CalcTypeData["type"]>("CRIT")
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
    const newScore = getArtifactScore(datas, calcType)
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
      <div className="inline-flex gap-4 items-center">
        <div className="flex flex-col items-center py-2 px-4 rounded shadow">
          <div className="h-6">
            {textOcr !== "" ? (
              <span className="text-base-content">
                {textOcr} ({progress}%)
              </span>
            ) : (
              <span className="text-base-content">Progress</span>
            )}
          </div>
          <progress
            className="w-56 progress"
            value={progress}
            max={100}
          ></progress>
        </div>
        <button className="btn" onClick={handleClick}>
          recognize
        </button>
      </div>
      <select
        className="w-full max-w-sm select select-bordered"
        defaultValue={0}
        onChange={(e) => {
          const type = e.currentTarget.value as CalcTypeData["type"]
          if (substats.length) {
            setScore(getArtifactScore(substats, type))
          }
          setCalcType(type)
        }}
      >
        {CalcTypeDataList.map((data) => (
          <option key={data.type} value={data.type}>
            {data.label}
          </option>
        ))}
      </select>
      <div className="flex flex-col w-full max-w-sm">
        <div className="w-full max-w-sm artifact-heading">
          <span>{CalcTypeMap[calcType].name}</span>
        </div>
        <div className="w-full max-w-sm h-48 bg-gradient-to-br from-gray-600 to-orange-300"></div>
      </div>
      {!!url && <img src={url} />}
      <div className="flex gap-4 items-center">
        {!!substats.length && (
          <div className="shadow stats">
            <div className="text-center stat">
              <div className="stat-title">ARTIFACT SCORE</div>
              <div className="stat-value">
                {Math.round(score * 10) / 10}
                {(() => {
                  if (score >= 45) {
                    return <span className="text-error">(SS)</span>
                  }
                  if (score >= 35) {
                    return <span className="text-warning">(S)</span>
                  }
                  if (score >= 25) {
                    return <span className="text-primary">(A)</span>
                  }
                  return <span className="text-info">(B)</span>
                })()}
              </div>
            </div>
          </div>
        )}
        <div className="flex flex-col">
          {substats.map((s) => (
            <span key={s.label}>
              ・{s.label} ({getSubStatusRate(s)}%)
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default App
