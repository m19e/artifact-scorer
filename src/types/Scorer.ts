import type { Dispatch, SetStateAction } from "react"
import {
  CalcModeMap,
  ArtifactSet,
  ArtifactType,
  MainStatus,
  SubStatus,
} from "@/consts/Scorer"

export type SetValue<T> = Dispatch<SetStateAction<T>>

export type CalcModeID = keyof typeof CalcModeMap
type CalcModeObject = typeof CalcModeMap[CalcModeID]
export type CalcModeName = CalcModeObject["name"]
export type CalcModeDesc = CalcModeObject["desc"]
export type CalcModeLabel = CalcModeObject["label"]
export interface CalcModeData {
  id: CalcModeID
  name: CalcModeName
  desc: CalcModeDesc
  label: CalcModeLabel
}

export type ArtifactSetID = keyof typeof ArtifactSet
type ArtifactSetName = typeof ArtifactSet[ArtifactSetID]
export interface ArtifactSetData {
  id: ArtifactSetID
  name: ArtifactSetName
}

export type ArtifactTypeID = keyof typeof ArtifactType
export type ArtifactTypeName = typeof ArtifactType[ArtifactTypeID]
export interface ArtifactTypeData {
  id: ArtifactTypeID
  name: ArtifactTypeName
  main: MainStatusData[]
}

export type MainStatusID = keyof typeof MainStatus
type MainStatusName = typeof MainStatus[MainStatusID]
export interface MainStatusData {
  id: MainStatusID
  name: MainStatusName
  max: number
  min: number
}

export type SubStatusID = keyof typeof SubStatus
export type SubStatusName = typeof SubStatus[SubStatusID]
export interface SubStatusData {
  id: SubStatusID
  name: SubStatusName
  param: {
    type: "flat" | "percent"
    value: number
  }
}

export interface Artifact {
  id: string
  level: number
  set: ArtifactSetData
  type: Omit<ArtifactTypeData, "main">
  main: MainStatusData
  subs: SubStatusData[]
}

export interface ScorableArtifactProps {
  artifact: Artifact
  calcMode: CalcModeData
}
