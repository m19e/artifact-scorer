import type { CalcTypeData, SubStatusType as TSubStatus } from "@/types/Scorer"

export const CalcType = {
  CRIT: "会心率/ダメージ型（汎用火力用）",
  ENERGY_RECHARGE: "元素チャージ効率型（絶縁の旗印）",
  DEF: "防御型（華館夢醒形骸記）",
  HP: "HP型（鍾離/胡桃）",
  ELEMENTAL_MASTERY: "元素熟知型（翠緑の影）",
} as const

export const SubStatusType = {
  HP_FLAT: "HP_FLAT",
  DEF_FLAT: "DEF_FLAT",
  ATK_FLAT: "ATK_FLAT",
  HP_PER: "HP_PER",
  DEF_PER: "DEF_PER",
  ATK_PER: "ATK_PER",
  ELEMENTAL_MASTERY: "ELEMENTAL_MASTERY",
  ENERGY_RECHARGE: "ENERGY_RECHARGE",
  CRIT_RATE: "CRIT_RATE",
  CRIT_DAMAGE: "CRIT_DAMAGE",
  UNDETECTED: "UNDETECTED",
} as const

export const CalcTypeMap: { [key in CalcTypeData["type"]]: CalcTypeData } = {
  CRIT: {
    label: CalcType.CRIT,
    type: "CRIT",
    name: "会心率/ダメージ型",
    description: "汎用火力用",
  },
  ENERGY_RECHARGE: {
    label: CalcType.ENERGY_RECHARGE,
    type: "ENERGY_RECHARGE",
    name: "元素チャージ効率型",
    description: "絶縁の旗印",
  },
  DEF: {
    label: CalcType.DEF,
    type: "DEF",
    name: "防御型",
    description: "華館夢醒形骸記",
  },
  HP: {
    label: CalcType.HP,
    type: "HP",
    name: "HP型",
    description: "鍾離/胡桃",
  },
  ELEMENTAL_MASTERY: {
    label: CalcType.ELEMENTAL_MASTERY,
    type: "ELEMENTAL_MASTERY",
    name: "元素熟知型",
    description: "翠緑の影",
  },
}

export const CalcTypeDataList: CalcTypeData[] = Object.values(CalcTypeMap)

export const SubStatusMap: { [key in TSubStatus]: { max: number } } = {
  HP_FLAT: { max: 299 },
  DEF_FLAT: { max: 23 },
  ATK_FLAT: { max: 19 },
  HP_PER: { max: 5.8 },
  DEF_PER: { max: 7.3 },
  ATK_PER: { max: 5.8 },
  ELEMENTAL_MASTERY: { max: 23 },
  ENERGY_RECHARGE: { max: 6.5 },
  CRIT_RATE: { max: 3.9 },
  CRIT_DAMAGE: { max: 7.8 },
  UNDETECTED: { max: 0 },
}
