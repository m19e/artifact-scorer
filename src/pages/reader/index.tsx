import { useState } from "react"
import { createWorker } from "tesseract.js"
import type { ImageLike } from "tesseract.js"

import type {
  CalcTypeData,
  SubStatus,
  SubStatusType as TSubStatus,
} from "@/types/Scorer"
import {
  CalcTypeMap,
  CalcTypeDataList,
  SubStatusType,
  SubStatusMap,
} from "@/consts/Scorer"

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

const ArtifactType = {
  FLOWER: "生の花",
  PLUME: "死の羽",
  SANDS: "時の砂",
  GOBLET: "空の杯",
  CIRCLET: "理の冠",
} as const

type ArtifactTypeKey = keyof typeof ArtifactType

type ArtifactTypeValue = typeof ArtifactType[ArtifactTypeKey]

const MainStatus = {
  HP_ACT: "HP_ACT",
  ATK_ACT: "ATK_ACT",
  ATK_PER: "ATK_PER",
  HP_PER: "HP_PER",
  DEF_PER: "DEF_PER",
  ENERGY_RECHARGE: "ENERGY_RECHARGE",
  ELEMENTAL_MASTERY: "ELEMENTAL_MASTERY",
  ELEMENTAL_DMG_BONUS: "ELEMENTAL_DMG_BONUS",
  PHYSICAL_DMG_BONUS: "PHYSICAL_DMG_BONUS",
  CRIT_RATE: "CRIT_RATE",
  CRIT_DAMAGE: "CRIT_DAMAGE",
  HEALING_BONUS: "HEALING_BONUS",
} as const

type MainStatusType = typeof MainStatus[keyof typeof MainStatus]

interface MainStatusData {
  type: MainStatusType
  label: string
  max: number
  min: number
}

const MainStatusMap: { [key in MainStatusType]: MainStatusData } = {
  HP_ACT: {
    type: "HP_ACT",
    label: "HP(実数)",
    max: 4780,
    min: 717,
  },
  ATK_ACT: {
    type: "ATK_ACT",
    label: "攻撃力(実数)",
    max: 311,
    min: 47,
  },
  ATK_PER: {
    type: "ATK_PER",
    label: "攻撃力(%)",
    max: 46.6,
    min: 7,
  },
  ENERGY_RECHARGE: {
    type: "ENERGY_RECHARGE",
    label: "元素チャージ効率",
    max: 51.8,
    min: 7.8,
  },
  ELEMENTAL_DMG_BONUS: {
    type: "ELEMENTAL_DMG_BONUS",
    label: "元素ダメージ",
    max: 46.6,
    min: 7,
  },
  PHYSICAL_DMG_BONUS: {
    type: "PHYSICAL_DMG_BONUS",
    label: "物理ダメージ",
    max: 58.3,
    min: 8.7,
  },
  CRIT_RATE: {
    type: "CRIT_RATE",
    label: "会心率",
    max: 31.1,
    min: 4.7,
  },
  CRIT_DAMAGE: {
    type: "CRIT_DAMAGE",
    label: "会心ダメージ",
    max: 62.2,
    min: 9.3,
  },
  HEALING_BONUS: {
    type: "HEALING_BONUS",
    label: "与える治療効果",
    max: 35.9,
    min: 5.4,
  },
  HP_PER: {
    type: "HP_PER",
    label: "HP(%)",
    max: 46.6,
    min: 7,
  },
  DEF_PER: {
    type: "DEF_PER",
    label: "防御力(%)",
    max: 58.3,
    min: 8.7,
  },
  ELEMENTAL_MASTERY: {
    type: "ELEMENTAL_MASTERY",
    label: "元素熟知",
    max: 187,
    min: 28,
  },
}

interface ArtifactTypeData {
  type: ArtifactTypeKey
  name: ArtifactTypeValue
  main: MainStatusData[]
}

const ArtifactTypeMap: { [key in ArtifactTypeKey]: ArtifactTypeData } = {
  FLOWER: {
    type: "FLOWER",
    name: ArtifactType.FLOWER,
    main: [MainStatusMap.HP_ACT],
  },
  PLUME: {
    type: "PLUME",
    name: ArtifactType.PLUME,
    main: [MainStatusMap.ATK_ACT],
  },
  SANDS: {
    type: "SANDS",
    name: ArtifactType.SANDS,
    main: [
      MainStatusMap.ATK_PER,
      MainStatusMap.ENERGY_RECHARGE,
      MainStatusMap.HP_PER,
      MainStatusMap.DEF_PER,
      MainStatusMap.ELEMENTAL_MASTERY,
    ],
  },
  GOBLET: {
    type: "GOBLET",
    name: ArtifactType.GOBLET,
    main: [
      MainStatusMap.ELEMENTAL_DMG_BONUS,
      MainStatusMap.PHYSICAL_DMG_BONUS,
      MainStatusMap.ATK_PER,
      MainStatusMap.HP_PER,
      MainStatusMap.DEF_PER,
      MainStatusMap.ELEMENTAL_MASTERY,
    ],
  },
  CIRCLET: {
    type: "CIRCLET",
    name: ArtifactType.CIRCLET,
    main: [
      MainStatusMap.CRIT_RATE,
      MainStatusMap.CRIT_DAMAGE,
      MainStatusMap.HEALING_BONUS,
      MainStatusMap.ATK_PER,
      MainStatusMap.HP_PER,
      MainStatusMap.DEF_PER,
      MainStatusMap.ELEMENTAL_MASTERY,
    ],
  },
}

const ArtifactTypeList = Object.values(ArtifactTypeMap)

const getSubStatusType = ({
  status,
  isPercent,
}: {
  status: string
  isPercent: boolean
}): TSubStatus => {
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
        return String(+c.charCodeAt(0).toString(16) - 2459)
      }
      return c
    })
    .join("")
}

const getSubStatusData = (line: string): SubStatus => {
  const [s, p] = line.split("+")
  const isPercent = p.includes("%")
  const status = s.replace("カ", "力")
  const type = getSubStatusType({ status, isPercent })
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

const getArtifactScore = ({
  datas,
  calcType,
}: {
  datas: SubStatus[]
  calcType: CalcTypeData["type"]
}): number => {
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
  const [calcMode, setCalcMode] = useState<CalcTypeData>(CalcTypeMap.CRIT)
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
    const newScore = getArtifactScore({ datas, calcType: calcMode.type })
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
            setScore(getArtifactScore({ datas: substats, calcType: type }))
          }
          setCalcMode(CalcTypeMap[type])
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
          <span>{calcMode.name}</span>
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
