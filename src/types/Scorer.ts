import { CalcType, SubStatusType } from "@/consts/Scorer"

type CalcTypeKey = keyof typeof CalcType

type CalcType = typeof CalcType[CalcTypeKey]

export interface CalcTypeData {
  label: CalcType
  type: CalcTypeKey
  name: string
  description: string
}

export type SubStatusType = typeof SubStatusType[keyof typeof SubStatusType]

export interface SubStatus {
  label: string
  type: SubStatusType
  status: string
  param: {
    label: string
    type: "flat" | "percent"
    value: number
  }
}
