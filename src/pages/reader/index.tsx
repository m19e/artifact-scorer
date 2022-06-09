import { Fragment, useState, useRef, useEffect, useCallback } from "react"
import type { Dispatch, SetStateAction } from "react"
import { createWorker } from "tesseract.js"
import type { ImageLike, Rectangle } from "tesseract.js"

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
import { RectCropper } from "@/components/molecules/RectCropper"
import { Progress } from "@/components/atoms/Progress"
import { ArtifactScoreBox } from "@/components/atoms/ArtifactScoreBox"
import { TwitterShareButton } from "@/components/atoms/TwitterShareButton"
import { ArtTypeIcon } from "@/components/atoms/ArtifactTypeIcons"

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

const getArtifactScore = ({
  datas,
  mode,
}: {
  datas: SubStatusData[]
  mode: CalcModeID
}): number => {
  return datas
    .filter(({ param }) => !Number.isNaN(param.value))
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
  if (id === "UNDETECTED" || Number.isNaN(value) || value === 0) {
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

const useArtifact = (
  initialArt: Artifact = DEFAULT_ARTIFACT_DATA
): [ArtifactState, ArtifactAction] => {
  const [artSetID, setArtSetID] = useState<ArtifactSetID>(initialArt.set.id)
  const [artTypeID, setArtTID] = useState<ArtifactTypeID>(initialArt.type.id)
  const [mainType, setMainType] = useState(initialArt.main.id)
  const [substats, setSubs] = useState<SubStatusData[]>([])

  const [calcMode, setCalcMode] = useState<CalcModeData>(CalcModeMap.CRIT)
  const [score, setScore] = useState(0)

  const artifactRef = useRef<Artifact>(initialArt)

  useEffect(() => {
    artifactRef.current = {
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
    }
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

  const [rectangle, setRectangle] = useState<Rectangle>({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
  })

  const [states, actions] = useArtifact()
  const [storedArts, setStoredArts] = useLocalStorage<Artifact[]>(
    "artifacts",
    []
  )

  const tryOcr = useCallback(async () => {
    const worker = createWorker({
      logger: (m: { status: string; progress: number }) => {
        setProgress(Math.round(m.progress * 100))
        // setTextOcr(m.status)
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

  const handleDrop = (file: File) => {
    setUrl(URL.createObjectURL(file))
    setFile(file)
  }
  const handleClick = async () => {
    setTextOcr("Recognizing...")
    await tryOcr()
  }

  const { artSetID, artTypeID, mainType, substats, artifact, calcMode, score } =
    states

  return (
    <div className="flex justify-center">
      <div className="flex flex-col gap-4 py-4 max-w-sm">
        {url ? (
          <div className="flex gap-4 items-center w-full">
            <div className="overflow-hidden flex-1 h-72 rounded-xl sm:w-72 bg-base-300">
              <RectCropper url={url} onCrop={setRectangle} />
            </div>
            <div className="btn" onClick={() => setUrl("")}>
              delete
            </div>
          </div>
        ) : (
          <Dropzone onDrop={handleDrop} />
        )}
        <div className="inline-flex gap-4 items-center">
          <Progress label={textOcr} progress={progress} />
          <button className="btn" disabled={!url} onClick={handleClick}>
            recognize
          </button>
        </div>
        <select
          className="select select-bordered"
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
        {!!substats.length && (
          <div className="flex flex-col">
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
                        checked
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
                <div className="pr-1 h-5 text-white bg-slate-700 rounded">
                  <div className="-mt-1.5">
                    <span className="text-xl font-black text-white">+20</span>
                  </div>
                </div>
                <TwitterShareButton url="" />
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
                        ({getSubStatusRate(s).toFixed()}%)
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
        <div className="flex flex-col items-center">
          <button
            className="w-24 btn"
            disabled={!substats.length}
            onClick={() => {
              const id = Date.now().toString(16)
              setStoredArts((prev) => [{ ...artifact, id }, ...prev])
            }}
          >
            save
          </button>
          {storedArts.map(({ id, type, set, main, subs }) => (
            <div key={id} className="dropdown dropdown-top">
              <label tabIndex={0} className="p-0 w-14 h-14 btn btn-sm">
                <ArtTypeIcon name={type.name} />
              </label>
              <div
                tabIndex={0}
                className="flex flex-col px-4 pt-4 min-w-max shadow dropdown-content bg-base-100 text-base-content rounded-box"
              >
                <div className="flex flex-col items-center font-bold">
                  <h1>
                    {set.name} / {type.name}
                  </h1>
                  <span>
                    {main.name}+{main.max}
                  </span>
                </div>
                <div className="my-2 h-0 divider"></div>
                <div className="flex flex-col">
                  {subs.map((sub) => (
                    <div key={sub.id} className="flex justify-between">
                      <span>{sub.name}</span>
                      <span>
                        +{sub.param.value}
                        {sub.param.type === "percent" ? "%" : ""}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="my-2 h-0 divider"></div>
                <div className="flex justify-end mb-2">
                  <label
                    htmlFor={"modal-remove-" + id}
                    className="hover:bg-opacity-20 modal-button text-error text-opacity-75 hover:bg-error btn btn-sm btn-error btn-circle btn-ghost"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-6 h-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </label>

                  <button className="text-neutral-focus text-opacity-75 btn btn-sm btn-circle btn-ghost">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-6 h-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {storedArts.map((art) => (
        <Fragment key={art.id}>
          <input
            type="checkbox"
            id={"modal-remove-" + art.id}
            className="modal-toggle"
          />
          <div className="modal">
            <div className="modal-box">
              <h3 className="text-lg font-bold">削除しますか？</h3>
              <p className="py-4">{JSON.stringify(art, null, 0)}</p>
              <div className="flex justify-between">
                <div className="modal-action">
                  <label
                    htmlFor={"modal-remove-" + art.id}
                    className="btn btn-outline"
                  >
                    閉じる
                  </label>
                </div>
                <div className="modal-action">
                  <label
                    htmlFor={"modal-remove-" + art.id}
                    className="btn btn-error"
                    onClick={() =>
                      setStoredArts((prev) =>
                        prev.filter((a) => a.id !== art.id)
                      )
                    }
                  >
                    削除
                  </label>
                </div>
              </div>
            </div>
          </div>
        </Fragment>
      ))}
    </div>
  )
}

export default App
