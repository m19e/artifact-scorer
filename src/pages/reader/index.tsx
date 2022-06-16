import Image from "next/image"
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

import { Dropzone } from "@/components/molecules/Dropzone"
import { RectCropper } from "@/components/molecules/RectCropper"
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
  const [collapseOpen, setCollapseOpen] = useState(true)
  const [file, setFile] = useState<ImageLike>("")
  const [url, setUrl] = useState("")
  const [inOCRProcess, setInOCRProcess] = useState(false)

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

  const handleDrop = (file: File) => {
    setUrl(URL.createObjectURL(file))
    setFile(file)
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
        <div className="md:max-w-md navbar bg-neutral text-neutral-content md:rounded-b-box">
          <div className="navbar-start"></div>
          <div className="navbar-center">
            <a className="text-xl normal-case btn btn-ghost">#ArtifactScorer</a>
          </div>
          <div className="navbar-end"></div>
        </div>
        <div className="flex flex-col my-4 max-w-sm">
          <div
            tabIndex={0}
            className={
              "border collapse collapse-arrow border-base-300 bg-base-100 rounded-box " +
              (collapseOpen ? "collapse-open" : "collapse-close")
            }
          >
            <div
              className="text-lg font-medium text-base-content collapse-title"
              onClick={() => setCollapseOpen((prev) => !prev)}
            >
              画像読み込み
            </div>
            <div className="text-base-content collapse-content">
              {url ? (
                <div className="flex flex-col">
                  <div className="flex gap-4 items-center w-full">
                    <div className="overflow-hidden relative flex-1 h-80 rounded-xl sm:w-80 bg-base-300">
                      <div className="absolute top-1 left-1 z-50 h-6 rounded-full bg-base-100 dropdown">
                        <label
                          tabIndex={0}
                          className="btn btn-circle btn-ghost btn-xs text-info"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-5 h-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </label>
                        <div
                          tabIndex={0}
                          className="w-72 shadow-xl card dropdown-content bg-base-100"
                        >
                          <div className="p-4 card-body">
                            <h2 className="text-base card-title">
                              サブステータスを範囲選択してください
                            </h2>
                            <p className="text-xs">トリミング例:</p>
                            <figure>
                              <Image
                                width={300}
                                height={160}
                                src="/trimming-example.png"
                                alt="トリミング例"
                              />
                            </figure>
                          </div>
                        </div>
                      </div>
                      <div className="flex absolute top-1 right-1 z-50 justify-center items-center w-9 h-9 bg-base-100 rounded-box">
                        <button
                          className="btn btn-sm btn-square"
                          onClick={() => setUrl("")}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-6 h-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                      <RectCropper url={url} onCrop={setRectangle} />
                    </div>
                  </div>
                </div>
              ) : (
                <Dropzone onDrop={handleDrop} />
              )}
            </div>
          </div>
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
              {storedArts.map((art) => {
                const { id, type, set, main, subs } = art

                return (
                  <div key={id} className="w-14 h-14 artifact-dropdown">
                    <label
                      tabIndex={0}
                      className="p-0 w-full h-full btn btn-sm btn-ghost bg-base-100 text-neutral-focus"
                    >
                      <ArtTypeIcon name={type.name} />
                    </label>
                    <div
                      tabIndex={0}
                      className="flex flex-col p-3 min-w-max shadow dropdown-content bg-base-100 text-base-content rounded-box"
                    >
                      <div className="flex flex-col items-center text-base font-bold sm:text-xl">
                        <h1>
                          {set.name} / {type.name}
                        </h1>
                        <span>
                          {main.name}+{main.max}
                        </span>
                      </div>
                      <div className="my-2 h-0 divider"></div>
                      <div className="flex text-sm sm:text-lg">
                        <div className="flex flex-col flex-1">
                          {subs.map((sub) => (
                            <span key={sub.id}>{sub.name}</span>
                          ))}
                        </div>
                        <div className="flex flex-col">
                          {subs.map((sub) => (
                            <span key={sub.id}>
                              +{sub.param.value}
                              {sub.param.type === "percent" ? "%" : ""}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="my-2 h-0 divider"></div>
                      <div className="flex justify-end">
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
                )
              })}
            </div>
          </div>
        </div>
        <div className="flex flex-col flex-1 justify-end items-center w-full">
          <footer className="flex items-center p-4 w-full md:max-w-md footer bg-neutral text-neutral-content md:rounded-t-box">
            <div className="flex flex-1 items-center">
              <svg
                width="36"
                height="36"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                fillRule="evenodd"
                clipRule="evenodd"
                className="fill-current"
              >
                <path d="M22.672 15.226l-2.432.811.841 2.515c.33 1.019-.209 2.127-1.23 2.456-1.15.325-2.148-.321-2.463-1.226l-.84-2.518-5.013 1.677.84 2.517c.391 1.203-.434 2.542-1.831 2.542-.88 0-1.601-.564-1.86-1.314l-.842-2.516-2.431.809c-1.135.328-2.145-.317-2.463-1.229-.329-1.018.211-2.127 1.231-2.456l2.432-.809-1.621-4.823-2.432.808c-1.355.384-2.558-.59-2.558-1.839 0-.817.509-1.582 1.327-1.846l2.433-.809-.842-2.515c-.33-1.02.211-2.129 1.232-2.458 1.02-.329 2.13.209 2.461 1.229l.842 2.515 5.011-1.677-.839-2.517c-.403-1.238.484-2.553 1.843-2.553.819 0 1.585.509 1.85 1.326l.841 2.517 2.431-.81c1.02-.33 2.131.211 2.461 1.229.332 1.018-.21 2.126-1.23 2.456l-2.433.809 1.622 4.823 2.433-.809c1.242-.401 2.557.484 2.557 1.838 0 .819-.51 1.583-1.328 1.847m-8.992-6.428l-5.01 1.675 1.619 4.828 5.011-1.674-1.62-4.829z"></path>
              </svg>
              <p>ArtifactScorer by @m19e</p>
            </div>
            <div className="flex gap-2">
              <a>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  className="fill-current"
                >
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path>
                </svg>
              </a>
              <a>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  className="fill-current"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
            </div>
          </footer>
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
              <h3 className="text-lg font-bold">Delete this Artifact?</h3>
              <p className="py-4">{JSON.stringify(art, null, 0)}</p>
              <div className="flex justify-between">
                <div className="modal-action">
                  <label
                    htmlFor={"modal-remove-" + art.id}
                    className="btn btn-outline"
                  >
                    cancel
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
                    delete
                  </label>
                </div>
              </div>
            </div>
          </div>
        </Fragment>
      ))}
    </Fragment>
  )
}

export default App
