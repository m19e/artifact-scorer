import type { CalcModeData, SubStatusID } from "@/types/Scorer"

export const CalcMode = {
  CRIT: "会心率/ダメージ型（汎用火力用）",
  ENERGY_RECHARGE: "元素チャージ効率型（絶縁の旗印）",
  DEF: "防御型（華館夢醒形骸記）",
  HP: "HP型（鍾離/胡桃）",
  ELEMENTAL_MASTERY: "元素熟知型（翠緑の影）",
} as const

export const CalcModeMap = {
  CRIT: {
    id: "CRIT",
    label: CalcMode.CRIT,
    name: "会心率/ダメージ型",
    desc: "汎用火力用",
  },
  ENERGY_RECHARGE: {
    id: "ENERGY_RECHARGE",
    label: CalcMode.ENERGY_RECHARGE,
    name: "元素チャージ効率型",
    desc: "絶縁の旗印",
  },
  DEF: {
    id: "DEF",
    label: CalcMode.DEF,
    name: "防御型",
    desc: "華館夢醒形骸記",
  },
  HP: {
    id: "HP",
    label: CalcMode.HP,
    name: "HP型",
    desc: "鍾離/胡桃",
  },
  ELEMENTAL_MASTERY: {
    id: "ELEMENTAL_MASTERY",
    label: CalcMode.ELEMENTAL_MASTERY,
    name: "元素熟知型",
    desc: "翠緑の影",
  },
} as const

export const CalcModeList: CalcModeData[] = Object.values(CalcModeMap)

export const SubStatus = {
  HP_FLAT: "HP",
  DEF_FLAT: "防御力",
  ATK_FLAT: "攻撃力",
  HP_PER: "HP",
  DEF_PER: "防御力",
  ATK_PER: "攻撃力",
  ELEMENTAL_MASTERY: "元素熟知",
  ENERGY_RECHARGE: "元素チャージ効率",
  CRIT_RATE: "会心率",
  CRIT_DAMAGE: "会心ダメージ",
  UNDETECTED: "UNDETECTED",
} as const

export const SubStatusMap: { [key in SubStatusID]: { max: number } } = {
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
