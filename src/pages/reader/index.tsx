import { useState, useRef, useEffect, useCallback } from "react"
import type { Dispatch, SetStateAction } from "react"
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
import { useLocalStorage } from "@/hooks/useLocalStorage"

import { Dropzone } from "@/components/molecules/Dropzone"
import { TwitterShareButton } from "@/components/atoms/TwitterShareButton"

const ArtifactSetMap = {
  GLADIATORS_FINALE: "剣闘士のフィナーレ",
  WANDERERS_TROUPE: "大地を流浪する楽団",
  NOBLESSE_OBLIGE: "旧貴族のしつけ",
  BLOODSTAINED_CHIVALRY: "血染めの騎士道",
  MAIDEN_BELOVED: "愛される少女",
  VIRIDESCENT_VENERER: "翠緑の影",
  ARCHAIC_PETRA: "悠久の磐岩",
  RETRACING_BOLIDE: "逆飛びの流星",
  THUNDERSOOTHER: "雷を鎮める尊者",
  THUNDERING_FURY: "雷のような怒り",
  LAVAWALKER: "烈火を渡る賢者",
  CRIMSON_WITCH_OF_FLAMES: "燃え盛る炎の魔女",
  BLIZZARD_STRAYER: "氷風を彷徨う勇士",
  HEART_OF_DEPTH: "沈淪の心",
  TENACITY_OF_THE_MILLELITH: "千岩牢固",
  PALE_FLAME: "蒼白の炎",
  SHIMENAWAS_REMINISCENCE: "追憶のしめ縄",
  EMBLEM_OF_SEVERED_FATE: "絶縁の旗印",
  HUSK_OF_OPULENT_DREAMS: "華館夢醒形骸記",
  OCEAN_HUED_CLAM: "海染硨磲",
  VERMILLION_HEREAFTER: "辰砂往生録",
  ECHOES_OF_AN_OFFERING: "来歆の余響",
} as const

type ArtifactSetID = keyof typeof ArtifactSetMap

type ArtifactSetName = typeof ArtifactSetMap[ArtifactSetID]

interface ArtifactSetData {
  id: ArtifactSetID
  name: ArtifactSetName
}

const ArtifactSetDataList: ArtifactSetData[] = Object.entries(
  ArtifactSetMap
).map(([key, name]) => {
  const id = key as ArtifactSetID
  return { id, name }
})

const ArtifactType = {
  FLOWER: "生の花",
  PLUME: "死の羽",
  SANDS: "時の砂",
  GOBLET: "空の杯",
  CIRCLET: "理の冠",
} as const

type ArtifactTypeID = keyof typeof ArtifactType

type ArtifactTypeName = typeof ArtifactType[ArtifactTypeID]

const MainStatus = {
  HP_ACT: "HP_ACT",
  ATK_ACT: "ATK_ACT",
  ATK_PER: "ATK_PER",
  HP_PER: "HP_PER",
  DEF_PER: "DEF_PER",
  ENERGY_RECHARGE: "ENERGY_RECHARGE",
  ELEMENTAL_MASTERY: "ELEMENTAL_MASTERY",
  PYRO_DMG_BONUS: "PYRO_DMG_BONUS",
  HYDRO_DMG_BONUS: "HYDRO_DMG_BONUS",
  ANEMO_DMG_BONUS: "ANEMO_DMG_BONUS",
  ELECTRO_DMG_BONUS: "ELECTRO_DMG_BONUS",
  DENDRO_DMG_BONUS: "DENDRO_DMG_BONUS",
  CRYO_DMG_BONUS: "CRYO_DMG_BONUS",
  GEO_DMG_BONUS: "GEO_DMG_BONUS",
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
  PYRO_DMG_BONUS: {
    type: "PYRO_DMG_BONUS",
    label: "炎元素ダメージ",
    max: 46.6,
    min: 7.0,
  },
  HYDRO_DMG_BONUS: {
    type: "HYDRO_DMG_BONUS",
    label: "水元素ダメージ",
    max: 46.6,
    min: 7.0,
  },
  ANEMO_DMG_BONUS: {
    type: "ANEMO_DMG_BONUS",
    label: "風元素ダメージ",
    max: 46.6,
    min: 7.0,
  },
  ELECTRO_DMG_BONUS: {
    type: "ELECTRO_DMG_BONUS",
    label: "雷元素ダメージ",
    max: 46.6,
    min: 7.0,
  },
  DENDRO_DMG_BONUS: {
    type: "DENDRO_DMG_BONUS",
    label: "草元素ダメージ",
    max: 46.6,
    min: 7.0,
  },
  CRYO_DMG_BONUS: {
    type: "CRYO_DMG_BONUS",
    label: "氷元素ダメージ",
    max: 46.6,
    min: 7.0,
  },
  GEO_DMG_BONUS: {
    type: "GEO_DMG_BONUS",
    label: "岩元素ダメージ",
    max: 46.6,
    min: 7.0,
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
  id: ArtifactTypeID
  name: ArtifactTypeName
  main: MainStatusData[]
}

interface Artifact {
  id: string
  level: number
  set: ArtifactSetData
  type: {
    id: ArtifactTypeID
    name: ArtifactTypeName
  }
  main: {
    type: MainStatusType
    name: string
    value: number
  }
  subs: SubStatus[]
}

const ArtifactTypeMap: { [key in ArtifactTypeID]: ArtifactTypeData } = {
  FLOWER: {
    id: "FLOWER",
    name: ArtifactType.FLOWER,
    main: [MainStatusMap.HP_ACT],
  },
  PLUME: {
    id: "PLUME",
    name: ArtifactType.PLUME,
    main: [MainStatusMap.ATK_ACT],
  },
  SANDS: {
    id: "SANDS",
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
    id: "GOBLET",
    name: ArtifactType.GOBLET,
    main: [
      MainStatusMap.PYRO_DMG_BONUS,
      MainStatusMap.HYDRO_DMG_BONUS,
      MainStatusMap.ANEMO_DMG_BONUS,
      MainStatusMap.ELECTRO_DMG_BONUS,
      MainStatusMap.DENDRO_DMG_BONUS,
      MainStatusMap.CRYO_DMG_BONUS,
      MainStatusMap.GEO_DMG_BONUS,
      MainStatusMap.PHYSICAL_DMG_BONUS,
      MainStatusMap.ATK_PER,
      MainStatusMap.HP_PER,
      MainStatusMap.DEF_PER,
      MainStatusMap.ELEMENTAL_MASTERY,
    ],
  },
  CIRCLET: {
    id: "CIRCLET",
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

type SetValue<T> = Dispatch<SetStateAction<T>>

interface ArtifactState {
  artSetID: ArtifactSetID
  artTypeID: ArtifactTypeID
  mainType: MainStatusType
  substats: SubStatus[]
  calcMode: CalcTypeData
  score: number
  artifact: Artifact
}
interface ArtifactAction {
  setArtSetID: SetValue<ArtifactSetID>
  setSubStats: SetValue<SubStatus[]>
  setCalcType: (type: CalcTypeData["type"]) => void
  setArtTypeID: (id: ArtifactTypeID) => void
  setMainType: SetValue<MainStatusType>
}

const DEFAULT_ARTIFACT_DATA: Artifact = {
  id: "",
  level: 20,
  set: {
    id: "GLADIATORS_FINALE",
    name: "剣闘士のフィナーレ",
  },
  type: {
    id: "FLOWER",
    name: "生の花",
  },
  main: {
    type: "HP_ACT",
    name: MainStatusMap["HP_ACT"].label,
    value: MainStatusMap["HP_ACT"].max,
  },
  subs: [],
}

const useArtifact = (): [ArtifactState, ArtifactAction] => {
  const [artSetID, setArtSetID] = useState<ArtifactSetID>("GLADIATORS_FINALE")
  const [artTypeID, setArtTID] = useState<ArtifactTypeID>("FLOWER")
  const [mainType, setMainType] = useState(MainStatusMap.HP_ACT.type)
  const [substats, setSubs] = useState<SubStatus[]>([])

  const [calcMode, setCalcMode] = useState<CalcTypeData>(CalcTypeMap.CRIT)
  const [score, setScore] = useState(0)

  const artifactRef = useRef<Artifact>(DEFAULT_ARTIFACT_DATA)

  useEffect(() => {
    artifactRef.current = {
      id: "",
      level: 20,
      set: {
        id: artSetID,
        name: ArtifactSetMap[artSetID],
      },
      type: {
        id: artTypeID,
        name: ArtifactTypeMap[artTypeID].name,
      },
      main: {
        type: mainType,
        name: MainStatusMap[mainType].label,
        value: MainStatusMap[mainType].max,
      },
      subs: substats,
    }
  }, [artSetID, artTypeID, mainType, substats])

  const setSubStats = useCallback<SetValue<SubStatus[]>>(
    (newSubs) => {
      setSubs(newSubs)
      const datas = typeof newSubs === "function" ? newSubs(substats) : newSubs
      const newScore = getArtifactScore({ datas, calcType: calcMode.type })
      setScore(newScore)
    },
    [substats, calcMode]
  )

  const setCalcType = useCallback(
    (calcType: CalcTypeData["type"]) => {
      if (substats.length) {
        setScore(getArtifactScore({ datas: substats, calcType }))
      }
      setCalcMode(CalcTypeMap[calcType])
    },
    [substats]
  )

  const setArtTypeID = (id: ArtifactTypeID) => {
    setArtTID(id)
    setMainType(ArtifactTypeMap[id].main[0].type)
  }

  const states = {
    artSetID,
    artTypeID,
    mainType,
    substats,
    calcMode,
    score,
    artifact: artifactRef.current,
  }
  const actions = {
    setArtSetID,
    setSubStats,
    setCalcType,
    setArtTypeID,
    setMainType,
  }

  return [states, actions]
}

const App = () => {
  const [file, setFile] = useState<ImageLike>("")
  const [url, setUrl] = useState("")
  const [textOcr, setTextOcr] = useState<string>("")
  const [progress, setProgress] = useState(0)

  const [states, actions] = useArtifact()
  const [storedArts, setStoredArts] = useLocalStorage<Artifact[]>(
    "artifacts",
    []
  )
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
    actions.setSubStats(datas)
  }, [worker, file, actions])

  const handleDrop = (file: File) => {
    setUrl(URL.createObjectURL(file))
    setFile(file)
  }

  const handleClick = async () => {
    if (!file) return
    setTextOcr("Recognizing...")
    await tryOcr()
  }

  const { artSetID, artTypeID, mainType, substats, artifact, calcMode, score } =
    states

  return (
    <div className="flex justify-center">
      <div className="flex flex-col gap-4 py-4 max-w-sm">
        {url !== "" ? (
          <div className="flex gap-4 items-center">
            <img src={url} alt={url} />
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
          className="select select-bordered"
          onChange={(e) => {
            const type = e.currentTarget.value as CalcTypeData["type"]
            actions.setCalcType(type)
          }}
        >
          {CalcTypeDataList.map((data) => (
            <option key={data.type} value={data.type}>
              {data.label}
            </option>
          ))}
        </select>
        <div className="flex flex-col">
          <div className="h-10 artifact-heading">
            <select
              className="pl-1 w-52 text-xl bg-opacity-0 select select-ghost select-sm"
              onChange={(e) =>
                actions.setArtSetID(e.currentTarget.value as ArtifactSetID)
              }
            >
              {ArtifactSetDataList.map(({ id, name }) => (
                <option key={id} value={id} selected={id === artSetID}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div className="h-44 bg-gradient-to-br from-gray-600 to-orange-300">
            <div className="flex justify-between h-full">
              <div className="flex flex-col justify-between py-1 px-2">
                <select
                  className="w-24 h-6 min-h-0 text-base text-white bg-opacity-0 select select-sm select-ghost text-opacity-80"
                  onChange={(e) => {
                    actions.setArtTypeID(
                      e.currentTarget.value as ArtifactTypeID
                    )
                  }}
                >
                  {ArtifactTypeList.map((a) => (
                    <option key={a.name} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
                <div className="flex flex-col">
                  <select
                    className="h-6 min-h-0 text-base text-white bg-opacity-0 text-opacity-60 select select-sm select-ghost"
                    onChange={(e) => {
                      actions.setMainType(
                        e.currentTarget.value as MainStatusType
                      )
                    }}
                  >
                    {ArtifactTypeMap[artTypeID].main.map((m, i) => (
                      <option key={m.type + i} value={m.type}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                  <span className="pl-2.5 font-mono text-5xl text-white">
                    {MainStatusMap[mainType].max}
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
            <div className="flex flex-col py-3 bg-orange-100">
              <div className="flex justify-between items-center px-4">
                <div className="px-1.5 h-6 text-white bg-slate-700 rounded">
                  <span className="text-2xl font-black leading-5 text-white">
                    +20
                  </span>
                </div>
                <TwitterShareButton url="" />
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
        <div className="flex flex-col items-center">
          <div
            className="w-24 btn"
            onClick={() => {
              const id = Date.now().toString(16)
              setStoredArts((prev) => [{ ...artifact, id }, ...prev])
            }}
          >
            save
          </div>
          {storedArts.map(({ id, set, type, main, subs }) => (
            <div key={id} className="flex gap-2 items-center bg-base-200">
              <div className="flex flex-col">
                <h1>
                  {set.name} - {type.name} - {main.name}
                </h1>
                {subs.map((sub) => (
                  <span key={sub.type} className="whitespace-pre-wrap">
                    {" ・ "}
                    {sub.label}
                  </span>
                ))}
              </div>
              <div className="flex flex-col gap-2">
                <div className="btn btn-info btn-disabled">import</div>
                <div
                  className="btn btn-error"
                  onClick={() => {
                    setStoredArts((prev) => prev.filter((a) => a.id !== id))
                  }}
                >
                  delete
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default App
