import { Fragment, useState, useEffect, useCallback } from "react"
import type { Dispatch, SetStateAction } from "react"
import { createWorker } from "tesseract.js"
import type { ImageLike, Rectangle } from "tesseract.js"

import type {
  CalcModeID,
  CalcModeData,
  ArtifactSetID,
  ArtifactTypeID,
  MainStatusID,
  SubStatusID,
  SubStatusData,
  Artifact,
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
import { getArtifactScore } from "@/tools/Scorer"
import { useLocalStorage } from "@/hooks/useLocalStorage"

import { ImageLoader } from "@/components/molecules/ImageLoader"
import { Header } from "@/components/atoms/Header"
import { Footer } from "@/components/atoms/Footer"
import { ArtifactScoreBox } from "@/components/atoms/ArtifactScoreBox"
import { TwitterShareButton } from "@/components/atoms/TwitterShareButton"
import { ArtifactDropdown } from "@/components/atoms/ArtifactDropdown"
import { RemoveModal } from "@/components/atoms/ArtifactRemoveModal"

const SubStatusOption = {
  CRIT_RATE: "会心率",
  CRIT_DAMAGE: "会心ダメージ",
  ATK_PER: "攻撃力(%)",
  ENERGY_RECHARGE: "元素チャージ効率",
  DEF_PER: "防御力(%)",
  HP_PER: "HP(%)",
  ELEMENTAL_MASTERY: "元素熟知",
  HP_FLAT: "HP(実数)",
  DEF_FLAT: "防御力(実数)",
  ATK_FLAT: "攻撃力(実数)",
  UNDETECTED: "なし",
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

const reg = new RegExp("[\u{2460}-\u{2468}]", "u")
const isValidCharParamValue = (char: string): boolean =>
  char === "0" || char === "%" || char === "." || Boolean(char.match(reg))
const trimCircleFromNumber = (text: string): string => {
  const label = Array.from(text)
    .filter(isValidCharParamValue)
    .map((c) => {
      if (c.match(reg)) {
        return String(+c.charCodeAt(0).toString(16) - 2459)
      }
      return c
    })
    .join("")

  return label.startsWith(".") ? label.substring(1) : label
}

const checkIsPercent = (trim: string): boolean => {
  const endsWithPer = trim.endsWith("%")
  const includesPer = trim.includes("%")
  const includesDot = trim.includes(".")

  return endsWithPer || includesPer || includesDot
}

const isMatch = (target: string, match: string): boolean => {
  return Array.from(match).some((m) => target.includes(m))
}

const parseSubStatusText = (
  line: string
): { id: SubStatusID; paramLabel: string; isPer: boolean } => {
  const paramLabel = trimCircleFromNumber(line)
  const isPer = checkIsPercent(paramLabel)

  const id: SubStatusID = (() => {
    if (isPer) {
      if (isMatch(line, "会心")) {
        if (isMatch(line, "率")) return "CRIT_RATE"
        if (isMatch(line, "ダメージ")) return "CRIT_DAMAGE"
        return "CRIT_RATE"
      }
      if (isMatch(line, "攻撃")) return "ATK_PER"
      if (isMatch(line, "HP")) return "HP_PER"
      if (isMatch(line, "防御")) return "DEF_PER"
      if (isMatch(line, "元素チャージ効率")) return "ENERGY_RECHARGE"
    }

    if (isMatch(line, "HP")) return "HP_FLAT"
    if (isMatch(line, "防御")) return "DEF_FLAT"
    if (isMatch(line, "攻撃")) return "ATK_FLAT"
    if (isMatch(line, "元素熟知")) return "ELEMENTAL_MASTERY"

    return "UNDETECTED"
  })()

  return { id, isPer, paramLabel }
}

const getParamValue = (label: string): number => {
  const trim = +label.replace("%", "")
  if (Number.isNaN(trim)) return 0
  return +(Math.trunc(trim * 10) / 10).toFixed(1)
}

const getSubStatusData = (line: string): SubStatusData => {
  const { id, paramLabel, isPer } = parseSubStatusText(line)
  const name = SubStatus[id]
  const paramType = isPer ? "percent" : "flat"
  const paramValue = getParamValue(paramLabel)
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

const getSubStatusRate = (data: SubStatusData): number => {
  const {
    id,
    param: { value },
  } = data
  if (id === "UNDETECTED" || Number.isNaN(value) || value === 0) {
    return 0
  }
  const { max } = SubStatusMap[id]
  return Math.round((value / (max * 6)) * 100 * 10) / 10
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
  subs: [
    { id: "UNDETECTED", name: "なし", param: { type: "flat", value: 0 } },
    { id: "UNDETECTED", name: "なし", param: { type: "flat", value: 0 } },
    { id: "UNDETECTED", name: "なし", param: { type: "flat", value: 0 } },
    { id: "UNDETECTED", name: "なし", param: { type: "flat", value: 0 } },
  ],
}

const useArtifact = (
  initialArt: Artifact = DEFAULT_ARTIFACT_DATA
): [ArtifactState, ArtifactAction] => {
  const [artSetID, setArtSetID] = useState<ArtifactSetID>(initialArt.set.id)
  const [artTypeID, setArtTID] = useState<ArtifactTypeID>(initialArt.type.id)
  const [mainType, setMainType] = useState(initialArt.main.id)
  const [substats, setSubs] = useState<SubStatusData[]>(initialArt.subs)
  const [artifact, setArt] = useState<Artifact>(initialArt)

  const [calcMode, setCalcMode] = useState<CalcModeData>(CalcModeMap.CRIT)
  const [score, setScore] = useState(0)

  useEffect(() => {
    setArt({
      id: initialArt.id,
      level: initialArt.level,
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
    })
  }, [initialArt, artSetID, artTypeID, mainType, substats])

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
    artifact,
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

  const tryOcr = useCallback(async () => {
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
  }, [file, rectangle, actions])

  const handleDrop = (f: File) => {
    setUrl(URL.createObjectURL(f))
    setFile(f)
  }
  const handleClick = async () => {
    setInOCRProcess(true)
    await tryOcr()
    setInOCRProcess(false)
  }
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
                  onClick={handleClick}
                >
                  読取
                </button>
              )}
            </div>
          </div>
          <div className="flex flex-col">
            <div className="mb-2">
              <select
                className="w-full select select-bordered"
                onChange={(e) =>
                  actions.setCalcType(e.currentTarget.value as CalcModeID)
                }
              >
                {CalcModeList.map((data) => (
                  <option key={data.id} value={data.id}>
                    {data.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="artifact-heading">
              <div className="mt-1.5 ml-6">
                <select
                  className="pl-0 h-8 min-h-0 text-3xl font-bold leading-7 text-white bg-opacity-0 select select-ghost"
                  defaultValue={artSetID}
                  onChange={(e) =>
                    actions.setArtSetID(e.currentTarget.value as ArtifactSetID)
                  }
                >
                  {ArtifactSetList.map(({ id, name }) => (
                    <option key={id} value={id}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="h-44 bg-gradient-to-br from-gray-600 to-orange-300">
              <div className="flex justify-between h-full">
                <div className="flex flex-col justify-between ml-6">
                  <div className="mt-1">
                    <select
                      className="pl-0 w-24 h-6 min-h-0 text-base leading-5 text-white bg-opacity-0 select select-sm select-ghost text-opacity-80"
                      onChange={(e) =>
                        actions.setArtTypeID(
                          e.currentTarget.value as ArtifactTypeID
                        )
                      }
                    >
                      {ArtifactTypeList.map((a) => (
                        <option key={a.name} value={a.id}>
                          {a.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col">
                    <div className="-ml-0.5">
                      <select
                        className="pl-0 h-6 min-h-0 text-base leading-5 text-white bg-opacity-0 text-opacity-60 select select-sm select-ghost"
                        onChange={(e) =>
                          actions.setMainType(
                            e.currentTarget.value as MainStatusID
                          )
                        }
                      >
                        {ArtifactTypeMap[artTypeID].main.map((m, i) => (
                          <option key={m.id + i} value={m.id}>
                            {m.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <span className="font-mono text-4xl leading-7 text-white">
                      {MainStatusMap[mainType].max}
                    </span>
                    <div className="gap-1 my-2.5 rating">
                      <input
                        type="radio"
                        name="rating-2"
                        className="w-5 h-5 bg-yellow-400 mask mask-star-2"
                      />
                      <input
                        type="radio"
                        name="rating-2"
                        className="w-5 h-5 bg-yellow-400 mask mask-star-2"
                      />
                      <input
                        type="radio"
                        name="rating-2"
                        className="w-5 h-5 bg-yellow-400 mask mask-star-2"
                      />
                      <input
                        type="radio"
                        name="rating-2"
                        className="w-5 h-5 bg-yellow-400 mask mask-star-2"
                      />
                      <input
                        type="radio"
                        name="rating-2"
                        className="w-5 h-5 bg-yellow-400 mask mask-star-2"
                        defaultChecked
                      />
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
                {substats.map((s, index) => {
                  const isPer = s.param.type === "percent"
                  const step = isPer ? 0.1 : 1

                  return (
                    <div key={s.id + index} className="flex justify-between">
                      <div className="flex gap-1 items-center">
                        <span className="font-black whitespace-pre-wrap">
                          {" ・"}
                        </span>
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
                        ({getSubStatusRate(s).toFixed()}%)
                      </span>
                    </div>
                  )
                })}
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
