import { useState, useEffect, useCallback } from "react"
import type { Dispatch, SetStateAction } from "react"

import type {
  CalcModeID,
  CalcModeData,
  ArtifactSetID,
  ArtifactTypeID,
  MainStatusID,
  SubStatusData,
  Artifact,
} from "@/types/Scorer"
import {
  CalcModeMap,
  ArtifactSet,
  ArtifactType,
  ArtifactTypeMap,
  MainStatusMap,
} from "@/consts/Scorer"
import { getArtifactScore } from "@/tools/Scorer"

type SetValue<T> = Dispatch<SetStateAction<T>>

export interface ArtifactState {
  artSetID: ArtifactSetID
  artTypeID: ArtifactTypeID
  mainType: MainStatusID
  substats: SubStatusData[]
  calcMode: CalcModeData
  score: number
  artifact: Artifact
}

export interface ArtifactAction {
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

export const useArtifact = (
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
