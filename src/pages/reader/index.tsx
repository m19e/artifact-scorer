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

const ScoreType = {
  CRIT: "会心率/ダメージ型（汎用火力用）",
  ENERGY_RECHARGE: "元素チャージ効率型（絶縁の旗印）",
  DEF: "防御型（華館夢醒形骸記）",
  HP: "HP型（鍾離/胡桃）",
  ELEMENTAL_MASTERY: "元素熟知型（翠緑の影）",
} as const

type ScoreType = typeof ScoreType[keyof typeof ScoreType]

interface ScoreTypeData {
  label: ScoreType
  type: keyof typeof ScoreType
  name: string
  description: string
}

const ScoreTypeDataList: ScoreTypeData[] = Object.entries(ScoreType).map(
  ([k, v]) => {
    const label = v
    const type = k as keyof typeof ScoreType
    const [name, d] = v.split("（")
    const description = d.replace("）", "")
    return {
      label,
      type,
      name,
      description,
    }
  }
)

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

const SubStatusMap = new Map<keyof typeof SubStatusType, { max: number }>([
  ["HP_ACT", { max: 299 }],
  ["DEF_ACT", { max: 23 }],
  ["ATK_ACT", { max: 19 }],
  ["HP_PER", { max: 5.8 }],
  ["DEF_PER", { max: 7.3 }],
  ["ATK_PER", { max: 5.8 }],
  ["ELEMENTAL_MASTERY", { max: 23 }],
  ["ENERGY_RECHARGE", { max: 6.5 }],
  ["CRIT_RATE", { max: 3.9 }],
  ["CRIT_DAMAGE", { max: 7.8 }],
])

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

const getArtifactScore = (datas: SubStatus[], sType: ScoreType): number => {
  return datas
    .map(({ type, param }) => {
      switch (type) {
        case SubStatusType.CRIT_RATE:
          return param.value * 2

        case SubStatusType.CRIT_DAMAGE:
          return param.value

        case SubStatusType.ATK_PER:
          if (sType === ScoreType.CRIT) {
            return param.value
          }
          return 0

        case SubStatusType.ENERGY_RECHARGE:
          if (sType === ScoreType.ENERGY_RECHARGE) {
            return param.value
          }
          return 0

        case SubStatusType.DEF_PER:
          if (sType === ScoreType.DEF) {
            return param.value
          }
          return 0

        case SubStatusType.HP_PER:
          if (sType === ScoreType.HP) {
            return param.value
          }
          return 0

        case SubStatusType.ELEMENTAL_MASTERY:
          if (sType === ScoreType.ELEMENTAL_MASTERY) {
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
  const type = data.type.toUpperCase()
  const stat = SubStatusMap.get(type as keyof typeof SubStatusType)
  if (!stat) {
    return 0
  }
  return Math.round((data.param.value / (stat.max * 6)) * 100 * 10) / 10
}

const App = () => {
  const [file, setFile] = useState<ImageLike>("")
  const [url, setUrl] = useState("")
  const [textOcr, setTextOcr] = useState<string>("")
  const [progress, setProgress] = useState(0)
  const [substats, setSubStats] = useState<SubStatus[]>([])
  const [score, setScore] = useState(0)
  const [scoreType, setScoreType] = useState<ScoreType>(ScoreType.CRIT)
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
    const newScore = getArtifactScore(datas, scoreType)
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
          const type = e.currentTarget.value as ScoreType
          if (substats.length) {
            setScore(getArtifactScore(substats, type))
          }
          setScoreType(type)
        }}
      >
        {ScoreTypeDataList.map((data) => (
          <option key={data.type} value={data.label}>
            {data.label}
          </option>
        ))}
      </select>
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
