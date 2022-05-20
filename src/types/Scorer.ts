import { CalcType, SubStatusType } from "@/consts/Scorer"

type CalcType = typeof CalcType[keyof typeof CalcType]

export interface CalcTypeData {
  label: CalcType
  type: keyof typeof CalcType
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
    type: "actual" | "percent"
    value: number
  }
}
