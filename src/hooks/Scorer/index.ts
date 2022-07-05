import { useState, useCallback } from "react"
import type { Dispatch, SetStateAction } from "react"

import { CustomSubStatusMap } from "@/consts/Scorer"
import type {
  CalcModeID,
  CalcModeData,
  ArtifactSetID,
  ArtifactTypeID,
  MainStatusID,
  SubStatusData,
  Artifact,
  SubStatusBuildMap,
} from "@/types/Scorer"
import {
  CalcModeMap,
  ArtifactSet,
  ArtifactType,
  ArtifactTypeMap,
  MainStatusMap,
  CalcModeBuildMap,
} from "@/consts/Scorer"
import { getArtifactScore } from "@/tools/Scorer"
import { useLocalStorage } from "@/hooks/useLocalStorage"

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

type SetValue<T> = Dispatch<SetStateAction<T>>

export interface ArtifactState {
  artSetID: ArtifactSetID
  artTypeID: ArtifactTypeID
  mainType: MainStatusID
  substats: SubStatusData[]
  calcMode: CalcModeData
  score: number
  artifact: Artifact
  custom: typeof CustomSubStatusMap
}

export interface ArtifactAction {
  setArtSetID: SetValue<ArtifactSetID>
  setSubStats: SetValue<SubStatusData[]>
  setCalcType: (type: CalcModeID) => void
  setArtTypeID: (id: ArtifactTypeID) => void
  setMainType: SetValue<MainStatusID>
  setCustom: SetValue<typeof CustomSubStatusMap>
  updateSubStat: (index: number, newSub: SubStatusData) => void
}

export const useArtifact = (
  initialArt: Artifact = DEFAULT_ARTIFACT_DATA
): [ArtifactState, ArtifactAction] => {
  const [artSetID, setArtSetID] = useState<ArtifactSetID>(initialArt.set.id)
  const [artTypeID, setArtTID] = useState<ArtifactTypeID>(initialArt.type.id)
  const [mainType, setMainType] = useState(initialArt.main.id)
  const [substats, setSubs] = useState<SubStatusData[]>(initialArt.subs)

  const [calcMode, setCalcMode] = useState<CalcModeData>(CalcModeMap.CRIT)
  const [score, setScore] = useState(
    getArtifactScore({
      datas: initialArt.subs,
      build: CalcModeBuildMap.CRIT,
    })
  )

  const [custom, setCus] = useLocalStorage<SubStatusBuildMap>(
    "custom-build",
    CustomSubStatusMap
  )

  const setSubStats = useCallback<SetValue<SubStatusData[]>>(
    (newSubs) => {
      setSubs(newSubs)
      const datas = typeof newSubs === "function" ? newSubs(substats) : newSubs
      const build =
        calcMode.id === "CUSTOM" ? custom : CalcModeBuildMap[calcMode.id]
      const newScore = getArtifactScore({ datas, build })
      setScore(newScore)
    },
    [substats, custom, calcMode]
  )
  const updateSubStat = (index: number, newSub: SubStatusData) => {
    setSubStats((prev) => prev.map((sub, i) => (index === i ? newSub : sub)))
  }

  const setCalcType = useCallback(
    (mode: CalcModeID) => {
      if (substats.length) {
        const build = mode === "CUSTOM" ? custom : CalcModeBuildMap[mode]
        setScore(getArtifactScore({ datas: substats, build }))
      }
      setCalcMode(CalcModeMap[mode])
    },
    [custom, substats]
  )

  const setArtTypeID = (id: ArtifactTypeID) => {
    setArtTID(id)
    setMainType(ArtifactTypeMap[id].main[0].id)
  }

  const setCustom: SetValue<SubStatusBuildMap> = (build) => {
    const newCustom = typeof build === "function" ? build(custom) : build
    setScore(getArtifactScore({ datas: substats, build: newCustom }))
    setCus(build)
  }

  const artifact: Artifact = {
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

  const states = {
    artSetID,
    artTypeID,
    mainType,
    substats,
    calcMode,
    score,
    artifact,
    custom,
  }
  const actions = {
    setArtSetID,
    setSubStats,
    setCalcType,
    setArtTypeID,
    setMainType,
    setCustom,
    updateSubStat,
  }

  return [states, actions]
}
