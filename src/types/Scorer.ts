import { CalcModeMap, SubStatus } from "@/consts/Scorer"

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

export type SubStatusID = keyof typeof SubStatus
export type SubStatusName = typeof SubStatus[SubStatusID]
export interface SubStatusData {
  id: SubStatusID
  name: SubStatusName
  label: string
  param: {
    label: string
    type: "flat" | "percent"
    value: number
  }
}
