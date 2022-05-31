import { useState, useRef, useEffect, useCallback } from "react"
import type { Dispatch, SetStateAction } from "react"
import { createWorker } from "tesseract.js"
import type { ImageLike } from "tesseract.js"

import type {
  CalcModeID,
  CalcModeData,
  ArtifactSetID,
  ArtifactSetData,
  ArtifactTypeID,
  ArtifactTypeData,
  MainStatusID,
  MainStatusData,
  SubStatusID,
  SubStatusData,
} from "@/types/Scorer"
import {
  CalcModeMap,
  CalcModeList,
  ArtifactSet,
  ArtifactSetList,
  ArtifactType,
  ArtifactTypeMap,
  ArtifactTypeList,
  MainStatusMap,
  SubStatus,
  SubStatusMap,
} from "@/consts/Scorer"
import { useLocalStorage } from "@/hooks/useLocalStorage"

import { Dropzone } from "@/components/molecules/Dropzone"
import { TwitterShareButton } from "@/components/atoms/TwitterShareButton"

const SubStatusOption = {
  HP_FLAT: "HP(実数)",
  DEF_FLAT: "防御力(実数)",
  ATK_FLAT: "攻撃力(実数)",
  HP_PER: "HP(%)",
  DEF_PER: "防御力(%)",
  ATK_PER: "攻撃力(%)",
  ELEMENTAL_MASTERY: "元素熟知",
  ENERGY_RECHARGE: "元素チャージ効率",
  CRIT_RATE: "会心率",
  CRIT_DAMAGE: "会心ダメージ",
} as const
type SubStatusOptionID = keyof typeof SubStatusOption
type SubStatusOptionData = {
  id: SubStatusOptionID
  name: typeof SubStatusOption[SubStatusOptionID]
}
const SubStatusOptionList: SubStatusOptionData[] = Object.entries(
  SubStatusOption
).map(([key, name]) => {
  const id = key as SubStatusOptionID
  return { id, name }
})

const parseSubStatusText = (
  line: string
): { id: SubStatusID; paramLabel: string; isPer: boolean } => {
  const [status, p] = line.split("+")
  const paramLabel = trimCircleFromNumber(p)
  const isPer = p.includes("%")

  const id: SubStatusID = (() => {
    if (isPer) {
      if (status.includes("HP")) return "HP_PER"
      if (status.includes("防")) return "DEF_PER"
      if (status.includes("攻")) return "ATK_PER"
      if (status.includes("チャージ")) return "ENERGY_RECHARGE"
      if (status.includes("率")) return "CRIT_RATE"
      if (status.includes("ダメージ")) return "CRIT_DAMAGE"
    }
    if (status.includes("HP")) return "HP_FLAT"
    if (status.includes("防")) return "DEF_FLAT"
    if (status.includes("攻")) return "ATK_FLAT"
    if (status.includes("熟知")) return "ELEMENTAL_MASTERY"
    return "UNDETECTED"
  })()

  return { id, isPer, paramLabel }
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

const getSubStatusData = (line: string): SubStatusData => {
  const { id, paramLabel, isPer } = parseSubStatusText(line)
  const name = SubStatus[id]
  const paramType = isPer ? "percent" : "flat"
  const paramValue = +paramLabel.split("%").join("")
  const param: SubStatusData["param"] = {
    type: paramType,
    value: paramValue,
  }

  return {
    id,
    name,
    param,
  }
}

const updateSubStatusByID = ({
  id,
  src,
}: {
  id: SubStatusOptionID
  src: SubStatusData
}): SubStatusData => {
  const { value } = src.param
  const isPercent = [
    "HP_PER",
    "DEF_PER",
    "ATK_PER",
    "ENERGY_RECHARGE",
    "CRIT_RATE",
    "CRIT_DAMAGE",
  ].includes(id)
  const name = SubStatus[id]
  const param: SubStatusData["param"] = {
    type: isPercent ? "percent" : "flat",
    value,
  }

  return {
    id,
    name,
    param,
  }
}

const getSubStatusDatas = (text: string): SubStatusData[] => {
  return text
    .split("\n")
    .filter((l) => Boolean(l))
    .map((l) => getSubStatusData(l.replace(/\s/g, "")))
}

const getArtifactScore = ({
  datas,
  mode,
}: {
  datas: SubStatusData[]
  mode: CalcModeID
}): number => {
  return datas
    .map(({ id, param }) => {
      switch (id) {
        case "CRIT_RATE":
          return param.value * 2

        case "CRIT_DAMAGE":
          return param.value

        case "ATK_PER":
          if (mode === "CRIT") {
            return param.value
          }
          return 0

        case "ENERGY_RECHARGE":
          if (mode === "ENERGY_RECHARGE") {
            return param.value
          }
          return 0

        case "DEF_PER":
          if (mode === "DEF") {
            return param.value
          }
          return 0

        case "HP_PER":
          if (mode === "HP") {
            return param.value
          }
          return 0

        case "ELEMENTAL_MASTERY":
          if (mode === "ELEMENTAL_MASTERY") {
            return param.value / 2
          }
          return 0

        default:
          return 0
      }
    })
    .reduce((sum, elem) => sum + elem, 0)
}

const getSubStatusRate = (data: SubStatusData): number => {
  const {
    id,
    param: { value },
  } = data
  if (Number.isNaN(value)) {
    return 0
  }
  const { max } = SubStatusMap[id]
  return Math.round((value / (max * 6)) * 100 * 10) / 10
}

interface Artifact {
  id: string
  level: number
  set: ArtifactSetData
  type: Omit<ArtifactTypeData, "main">
  main: MainStatusData
  subs: SubStatusData[]
}

interface ArtifactState {
  artSetID: ArtifactSetID
  artTypeID: ArtifactTypeID
  mainType: MainStatusID
  substats: SubStatusData[]
  calcMode: CalcModeData
  score: number
  artifact: Artifact
}

type SetValue<T> = Dispatch<SetStateAction<T>>

interface ArtifactAction {
  setArtSetID: SetValue<ArtifactSetID>
  setSubStats: SetValue<SubStatusData[]>
  setCalcType: (type: CalcModeID) => void
  setArtTypeID: (id: ArtifactTypeID) => void
  setMainType: SetValue<MainStatusID>
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
  main: MainStatusMap["HP_FLAT"],
  subs: [],
}

const useArtifact = (): [ArtifactState, ArtifactAction] => {
  const [artSetID, setArtSetID] = useState<ArtifactSetID>("GLADIATORS_FINALE")
  const [artTypeID, setArtTID] = useState<ArtifactTypeID>("FLOWER")
  const [mainType, setMainType] = useState(MainStatusMap.HP_FLAT.id)
  const [substats, setSubs] = useState<SubStatusData[]>([])

  const [calcMode, setCalcMode] = useState<CalcModeData>(CalcModeMap.CRIT)
  const [score, setScore] = useState(0)

  const artifactRef = useRef<Artifact>(DEFAULT_ARTIFACT_DATA)

  useEffect(() => {
    artifactRef.current = {
      id: "",
      level: 20,
      set: {
        id: artSetID,
        name: ArtifactSet[artSetID],
      },
      type: {
        id: artTypeID,
        name: ArtifactType[artTypeID],
      },
      main: MainStatusMap[mainType],
      subs: substats,
    }
  }, [artSetID, artTypeID, mainType, substats])

  const setSubStats = useCallback<SetValue<SubStatusData[]>>(
    (newSubs) => {
      setSubs(newSubs)
      const datas = typeof newSubs === "function" ? newSubs(substats) : newSubs
      const newScore = getArtifactScore({ datas, mode: calcMode.id })
      setScore(newScore)
    },
    [substats, calcMode]
  )

  const setCalcType = useCallback(
    (mode: CalcModeID) => {
      if (substats.length) {
        setScore(getArtifactScore({ datas: substats, mode }))
      }
      setCalcMode(CalcModeMap[mode])
    },
    [substats]
  )

  const setArtTypeID = (id: ArtifactTypeID) => {
    setArtTID(id)
    setMainType(ArtifactTypeMap[id].main[0].id)
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
            const type = e.currentTarget.value as CalcModeID
            actions.setCalcType(type)
          }}
        >
          {CalcModeList.map((data) => (
            <option key={data.id} value={data.id}>
              {data.label}
            </option>
          ))}
        </select>
        {!!substats.length && (
          <div className="flex flex-col">
            <div className="h-10 artifact-heading">
              <select
                className="pl-1 w-52 text-xl bg-opacity-0 select select-ghost select-sm"
                onChange={(e) =>
                  actions.setArtSetID(e.currentTarget.value as ArtifactSetID)
                }
              >
                {ArtifactSetList.map(({ id, name }) => (
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
                    className="w-24 h-6 min-h-0 text-base leading-5 text-white bg-opacity-0 select select-sm select-ghost text-opacity-80"
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
                      className="h-6 min-h-0 text-base leading-5 text-white bg-opacity-0 text-opacity-60 select select-sm select-ghost"
                      onChange={(e) => {
                        actions.setMainType(
                          e.currentTarget.value as MainStatusID
                        )
                      }}
                    >
                      {ArtifactTypeMap[artTypeID].main.map((m, i) => (
                        <option key={m.id + i} value={m.id}>
                          {m.name}
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
                  <div className="shadow stats">
                    <div className="stat">
                      <div className="stat-title">聖遺物スコア</div>
                      <div className="stat-value">
                        {score.toFixed(1)}
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
                </div>
              </div>
            </div>
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
                {substats.map((s, index) => {
                  const isPer = s.param.type === "percent"
                  const step = isPer ? 0.1 : 1

                  return (
                    <div key={s.id} className="flex justify-between">
                      <div className="flex gap-1 items-center">
                        <span className="font-black">・</span>
                        <select
                          className="pr-7 pl-0 h-5 min-h-0 text-lg leading-4 text-slate-700 bg-opacity-0 select select-xs select-ghost"
                          defaultValue={s.id}
                          onChange={(e) => {
                            const id = e.currentTarget
                              .value as SubStatusOptionID
                            const data = updateSubStatusByID({ id, src: s })
                            actions.setSubStats((prev) =>
                              prev.map((sub, i) => (index === i ? data : sub))
                            )
                          }}
                        >
                          {SubStatusOptionList.map((opt) => (
                            <option key={opt.name} value={opt.id}>
                              {opt.name}
                            </option>
                          ))}
                        </select>
                        <div className="inline-flex font-black">
                          {/* <span>+</span> */}
                          <input
                            type="number"
                            inputMode="decimal"
                            className="px-0 w-14 text-lg font-black leading-4 text-slate-700 input input-xs input-ghost"
                            min={0}
                            step={step}
                            value={s.param.value}
                            onChange={(e) => {
                              const value = e.currentTarget.valueAsNumber
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
                          <span>{isPer ? "%" : ""}</span>
                        </div>
                      </div>
                      <span className="text-lg text-slate-500">
                        ({getSubStatusRate(s)}%)
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
        <div className="flex flex-col items-center">
          <div
            className="w-24 btn"
            onClick={() => {
              if (substats.length) {
                const id = Date.now().toString(16)
                setStoredArts((prev) => [{ ...artifact, id }, ...prev])
              }
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
                  <span key={sub.id} className="whitespace-pre-wrap">
                    {" ・ "}
                    {sub.name}+{sub.param.value}
                    {sub.param.type === "percent" ? "%" : ""}
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
