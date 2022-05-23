import { useState, useCallback } from "react"
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

const ArtifactSetMap = {
  GLADIATORS_FINALE: {
    name: "剣闘士のフィナーレ",
  },
  WANDERERS_TROUPE: {
    name: "大地を流浪する楽団",
  },
  NOBLESSE_OBLIGE: {
    name: "旧貴族のしつけ",
  },
  BLOODSTAINED_CHIVALRY: {
    name: "血染めの騎士道",
  },
  MAIDEN_BELOVED: {
    name: "愛される少女",
  },
  VIRIDESCENT_VENERER: {
    name: "翠緑の影",
  },
  ARCHAIC_PETRA: {
    name: "悠久の磐岩",
  },
  RETRACING_BOLIDE: {
    name: "逆飛びの流星",
  },
  // THUNDERSOOTHER: {
  //   name: "雷を鎮める尊者",
  // },
  THUNDERING_FURY: {
    name: "雷のような怒り",
  },
  // LAVAWALKER: {
  //   name: "烈火を渡る賢者",
  // },
  CRIMSON_WITCH_OF_FLAMES: {
    name: "燃え盛る炎の魔女",
  },
  BLIZZARD_STRAYER: {
    name: "氷風を彷徨う勇士",
  },
  HEART_OF_DEPTH: {
    name: "沈淪の心",
  },
  TENACITY_OF_THE_MILLELITH: {
    name: "千岩牢固",
  },
  PALE_FLAME: {
    name: "蒼白の炎",
  },
  SHIMENAWAS_REMINISCENCE: {
    name: "追憶のしめ縄",
  },
  EMBLEM_OF_SEVERED_FATE: {
    name: "絶縁の旗印",
  },
  HUSK_OF_OPULENT_DREAMS: {
    name: "華館夢醒形骸記",
  },
  OCEAN_HUED_CLAM: {
    name: "海染硨磲",
  },
  VERMILLION_HEREAFTER: {
    name: "辰砂往生録",
  },
  ECHOES_OF_AN_OFFERING: {
    name: "来歆の余響",
  },
} as const

type ArtifactSetName =
  typeof ArtifactSetMap[keyof typeof ArtifactSetMap]["name"]

const ArtifactSetNames = Object.values(ArtifactSetMap).map((s) => s.name)

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
  const [artType, setArtType] = useState<ArtifactTypeKey>("FLOWER")
  const [mainValue, setMainValue] = useState(MainStatusMap.HP_ACT.max)
  const [artSet, setArtSet] = useState<ArtifactSetName>("剣闘士のフィナーレ")
  const worker = createWorker({
    logger: (m: { status: string; progress: number }) => {
      setProgress(Math.round(m.progress * 100))
      // setTextOcr(m.status)
    },
  })

  const tryOcr = useCallback(async () => {
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
    await worker.terminate()

    const datas = getSubStatusDatas(text)
    const newScore = getArtifactScore({ datas, calcType: calcMode.type })
    setSubStats(datas)
    setScore(newScore)
  }, [worker, file, calcMode])

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
      {url !== "" ? (
        <div className="flex gap-4 items-center">
          <img src={url} />
          <div
            className="btn"
            onClick={() => {
              setUrl("")
            }}
          >
            delete
          </div>
        </div>
      ) : (
        <Dropzone onDrop={handleDrop} />
      )}
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
        <div className="w-full max-w-sm h-10 artifact-heading">
          <select
            className="pl-1 w-52 text-xl bg-opacity-0 select select-ghost select-sm"
            onChange={(e) => {
              const name = e.currentTarget.value as ArtifactSetName
              setArtSet(name)
            }}
          >
            {ArtifactSetNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <div className="w-full max-w-sm h-44 bg-gradient-to-br from-gray-600 to-orange-300">
          <div className="flex justify-between h-full">
            <div className="flex flex-col justify-between py-1 px-2">
              <select
                className="w-24 h-6 min-h-0 text-base text-white bg-opacity-0 select select-sm select-ghost text-opacity-80"
                onChange={(e) => {
                  const type = e.currentTarget.value as ArtifactTypeKey
                  setArtType(type)
                  setMainValue(ArtifactTypeMap[type].main[0].max)
                }}
              >
                {ArtifactTypeList.map((a) => (
                  <option key={a.name} value={a.type}>
                    {a.name}
                  </option>
                ))}
              </select>
              <div className="flex flex-col">
                <select
                  className="h-6 min-h-0 text-base text-white bg-opacity-0 text-opacity-60 select select-sm select-ghost"
                  onChange={(e) => {
                    const type = e.currentTarget.value as MainStatusType
                    setMainValue(MainStatusMap[type].max)
                  }}
                >
                  {ArtifactTypeMap[artType].main.map((m, i) => (
                    <option key={m.type + i} value={m.type}>
                      {m.label}
                    </option>
                  ))}
                </select>
                <span className="pl-2.5 font-mono text-5xl text-white">
                  {mainValue}
                </span>
                <span className="pl-2.5 -mt-1 text-2xl tracking-widest text-yellow-400">
                  ★★★★★
                </span>
              </div>
            </div>
            <div className="flex flex-col justify-center py-1 px-2">
              {!!substats.length && (
                <div className="shadow stats">
                  <div className="stat">
                    <div className="stat-title">聖遺物スコア</div>
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
                    <div className="pt-1 text-right stat-desc">
                      {calcMode.name}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        {!!substats.length && (
          <div className="flex flex-col py-3 w-full bg-orange-100">
            <div className="flex justify-between items-center px-4 w-full">
              <div className="px-1.5 h-6 text-white bg-slate-700 rounded">
                <span className="text-2xl font-black leading-5 text-white">
                  +20
                </span>
              </div>
              <a
                className="flex justify-center items-center w-10 h-10 text-white rounded-lg shadow"
                style={{ backgroundColor: "#00acee" }}
                href=""
                target="_blank"
              >
                <svg
                  className="w-5 h-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  stroke="currentColor"
                  viewBox="0 0 350 300"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M350.001,35.509 C346.026,42.167 340.649,49.197 333.870,56.595 C328.493,62.513 321.944,68.556 314.231,74.720 C314.231,74.720 314.231,76.940 314.231,76.940 C314.231,76.940 314.231,79.530 314.231,79.530 C314.231,80.762 314.346,81.626 314.579,82.119 C314.579,82.119 314.579,84.708 314.579,84.708 C314.579,110.109 310.022,135.572 300.903,161.097 C291.785,186.620 278.809,209.494 261.975,229.715 C243.971,251.417 222.113,268.556 196.394,281.134 C170.674,293.711 141.917,299.999 110.122,299.999 C89.546,299.999 70.142,297.041 51.904,291.122 C33.201,285.202 15.899,276.818 -0.001,265.967 C0.936,266.214 2.337,266.338 4.208,266.338 C7.948,266.831 10.755,267.077 12.626,267.077 C12.626,267.077 17.183,267.077 17.183,267.077 C33.550,267.077 49.567,264.242 65.231,258.569 C79.727,253.144 93.403,245.253 106.263,234.895 C91.300,234.649 77.387,229.469 64.531,219.357 C51.904,209.494 43.486,197.040 39.279,181.997 C42.786,182.737 45.007,183.105 45.943,183.105 C45.943,183.105 49.447,183.105 49.447,183.105 C50.151,183.352 51.202,183.476 52.605,183.476 C54.708,183.476 56.346,183.352 57.516,183.105 C59.853,183.105 63.128,182.612 67.335,181.626 C67.801,181.626 68.505,181.502 69.439,181.256 C70.376,181.009 71.075,180.887 71.542,180.887 C54.941,177.434 41.265,168.679 30.509,154.622 C19.520,140.565 14.029,124.536 14.029,106.534 C14.029,106.534 14.029,106.163 14.029,106.163 C14.029,106.163 14.029,105.794 14.029,105.794 C14.029,105.794 14.029,105.424 14.029,105.424 C18.471,108.383 23.615,110.603 29.460,112.082 C35.538,114.054 41.265,115.042 46.644,115.042 C36.354,107.644 28.640,98.642 23.497,88.038 C17.651,77.187 14.729,65.102 14.729,51.786 C14.729,44.388 15.546,37.729 17.183,31.810 C18.120,27.617 20.457,21.576 24.198,13.685 C42.435,37.358 64.177,55.854 89.429,69.172 C115.382,83.475 142.969,91.366 172.195,92.847 C171.494,87.667 171.145,84.832 171.145,84.339 C170.674,80.886 170.441,78.051 170.441,75.830 C170.441,54.868 177.456,36.989 191.483,22.193 C205.512,7.396 222.462,-0.002 242.337,-0.002 C252.623,-0.002 262.325,2.094 271.444,6.286 C280.562,10.971 288.394,16.891 294.942,24.042 C302.423,22.315 310.372,19.850 318.788,16.644 C325.803,13.931 333.051,10.232 340.532,5.547 C337.729,14.424 333.634,22.439 328.260,29.591 C322.179,36.989 315.751,42.907 308.969,47.347 C315.984,46.113 322.999,44.634 330.010,42.907 C335.388,41.428 342.052,38.961 350.001,35.509 Z"
                  />
                </svg>
              </a>
            </div>
            <div className="flex flex-col py-2 px-4">
              {substats.map((s) => (
                <div
                  key={s.label}
                  className="flex justify-between text-lg text-slate-700 whitespace-pre-wrap"
                >
                  <span className="font-black"> ・ {s.label}</span>
                  <span className="text-opacity-0">
                    ({getSubStatusRate(s)}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
