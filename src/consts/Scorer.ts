import type {
  CalcModeData,
  ArtifactSetData,
  ArtifactSetID,
  ArtifactTypeID,
  ArtifactTypeData,
  MainStatusID,
  MainStatusData,
  SubStatusID,
  CustomSubStatusData,
  SubStatusBuildMap,
} from "@/types/Scorer"

export const CalcMode = {
  CRIT: "会心率/ダメージ型（汎用火力用）",
  ENERGY_RECHARGE: "元素チャージ効率型（絶縁の旗印）",
  DEF: "防御型（華館夢醒形骸記）",
  HP: "HP型（鍾離/胡桃/夜蘭）",
  ELEMENTAL_MASTERY: "元素熟知型（翠緑の影）",
  CUSTOM: "カスタムビルド",
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
    desc: "鍾離/胡桃/夜蘭",
  },
  ELEMENTAL_MASTERY: {
    id: "ELEMENTAL_MASTERY",
    label: CalcMode.ELEMENTAL_MASTERY,
    name: "元素熟知型",
    desc: "翠緑の影",
  },
  CUSTOM: {
    id: "CUSTOM",
    label: CalcMode.CUSTOM,
    name: "カスタムビルド",
    desc: "",
  },
} as const

export const CalcModeList: CalcModeData[] = Object.values(CalcModeMap)

export const ArtifactSet = {
  GLADIATORS_FINALE: "剣闘士のフィナーレ",
  WANDERERS_TROUPE: "大地を流浪する楽団",
  NOBLESSE_OBLIGE: "旧貴族のしつけ",
  BLOODSTAINED_CHIVALRY: "血染めの騎士道",
  MAIDEN_BELOVED: "愛される少女",
  VIRIDESCENT_VENERER: "翠緑の影",
  ARCHAIC_PETRA: "悠久の磐岩",
  RETRACING_BOLIDE: "逆飛びの流星",
  THUNDERSOOTHER: "雷を鎮める尊者",
  THUNDERING_FURY: "雷のような怒り",
  LAVAWALKER: "烈火を渡る賢者",
  CRIMSON_WITCH_OF_FLAMES: "燃え盛る炎の魔女",
  BLIZZARD_STRAYER: "氷風を彷徨う勇士",
  HEART_OF_DEPTH: "沈淪の心",
  TENACITY_OF_THE_MILLELITH: "千岩牢固",
  PALE_FLAME: "蒼白の炎",
  SHIMENAWAS_REMINISCENCE: "追憶のしめ縄",
  EMBLEM_OF_SEVERED_FATE: "絶縁の旗印",
  HUSK_OF_OPULENT_DREAMS: "華館夢醒形骸記",
  OCEAN_HUED_CLAM: "海染硨磲",
  VERMILLION_HEREAFTER: "辰砂往生録",
  ECHOES_OF_AN_OFFERING: "来歆の余響",
} as const

export const ArtifactSetList: ArtifactSetData[] = Object.entries(
  ArtifactSet
).map(([key, name]) => {
  const id = key as ArtifactSetID
  return { id, name }
})

export const ArtifactType = {
  FLOWER: "生の花",
  PLUME: "死の羽",
  SANDS: "時の砂",
  GOBLET: "空の杯",
  CIRCLET: "理の冠",
} as const

export const MainStatus = {
  HP_FLAT: "HP(実数)",
  ATK_FLAT: "攻撃力(実数)",
  ATK_PER: "攻撃力(%)",
  ENERGY_RECHARGE: "元素チャージ効率",
  PYRO_DMG_BONUS: "炎元素ダメージ",
  HYDRO_DMG_BONUS: "水元素ダメージ",
  ANEMO_DMG_BONUS: "風元素ダメージ",
  ELECTRO_DMG_BONUS: "雷元素ダメージ",
  DENDRO_DMG_BONUS: "草元素ダメージ",
  CRYO_DMG_BONUS: "氷元素ダメージ",
  GEO_DMG_BONUS: "岩元素ダメージ",
  PHYSICAL_DMG_BONUS: "物理ダメージ",
  CRIT_RATE: "会心率",
  CRIT_DAMAGE: "会心ダメージ",
  HEALING_BONUS: "与える治療効果",
  HP_PER: "HP(%)",
  DEF_PER: "防御力(%)",
  ELEMENTAL_MASTERY: "元素熟知",
} as const

export const MainStatusMap: { [key in MainStatusID]: MainStatusData } = {
  HP_FLAT: {
    id: "HP_FLAT",
    name: "HP(実数)",
    max: 4780,
    min: 717,
  },
  ATK_FLAT: {
    id: "ATK_FLAT",
    name: "攻撃力(実数)",
    max: 311,
    min: 47,
  },
  ATK_PER: {
    id: "ATK_PER",
    name: "攻撃力(%)",
    max: 46.6,
    min: 7,
  },
  ENERGY_RECHARGE: {
    id: "ENERGY_RECHARGE",
    name: "元素チャージ効率",
    max: 51.8,
    min: 7.8,
  },
  PYRO_DMG_BONUS: {
    id: "PYRO_DMG_BONUS",
    name: "炎元素ダメージ",
    max: 46.6,
    min: 7.0,
  },
  HYDRO_DMG_BONUS: {
    id: "HYDRO_DMG_BONUS",
    name: "水元素ダメージ",
    max: 46.6,
    min: 7.0,
  },
  ANEMO_DMG_BONUS: {
    id: "ANEMO_DMG_BONUS",
    name: "風元素ダメージ",
    max: 46.6,
    min: 7.0,
  },
  ELECTRO_DMG_BONUS: {
    id: "ELECTRO_DMG_BONUS",
    name: "雷元素ダメージ",
    max: 46.6,
    min: 7.0,
  },
  DENDRO_DMG_BONUS: {
    id: "DENDRO_DMG_BONUS",
    name: "草元素ダメージ",
    max: 46.6,
    min: 7.0,
  },
  CRYO_DMG_BONUS: {
    id: "CRYO_DMG_BONUS",
    name: "氷元素ダメージ",
    max: 46.6,
    min: 7.0,
  },
  GEO_DMG_BONUS: {
    id: "GEO_DMG_BONUS",
    name: "岩元素ダメージ",
    max: 46.6,
    min: 7.0,
  },
  PHYSICAL_DMG_BONUS: {
    id: "PHYSICAL_DMG_BONUS",
    name: "物理ダメージ",
    max: 58.3,
    min: 8.7,
  },
  CRIT_RATE: {
    id: "CRIT_RATE",
    name: "会心率",
    max: 31.1,
    min: 4.7,
  },
  CRIT_DAMAGE: {
    id: "CRIT_DAMAGE",
    name: "会心ダメージ",
    max: 62.2,
    min: 9.3,
  },
  HEALING_BONUS: {
    id: "HEALING_BONUS",
    name: "与える治療効果",
    max: 35.9,
    min: 5.4,
  },
  HP_PER: {
    id: "HP_PER",
    name: "HP(%)",
    max: 46.6,
    min: 7,
  },
  DEF_PER: {
    id: "DEF_PER",
    name: "防御力(%)",
    max: 58.3,
    min: 8.7,
  },
  ELEMENTAL_MASTERY: {
    id: "ELEMENTAL_MASTERY",
    name: "元素熟知",
    max: 187,
    min: 28,
  },
}

export const ArtifactTypeMap: { [key in ArtifactTypeID]: ArtifactTypeData } = {
  FLOWER: {
    id: "FLOWER",
    name: ArtifactType.FLOWER,
    main: [MainStatusMap.HP_FLAT],
  },
  PLUME: {
    id: "PLUME",
    name: ArtifactType.PLUME,
    main: [MainStatusMap.ATK_FLAT],
  },
  SANDS: {
    id: "SANDS",
    name: ArtifactType.SANDS,
    main: [
      MainStatusMap.ATK_PER,
      MainStatusMap.ENERGY_RECHARGE,
      MainStatusMap.HP_PER,
      MainStatusMap.DEF_PER,
      MainStatusMap.ELEMENTAL_MASTERY,
    ],
  },
  GOBLET: {
    id: "GOBLET",
    name: ArtifactType.GOBLET,
    main: [
      MainStatusMap.PYRO_DMG_BONUS,
      MainStatusMap.HYDRO_DMG_BONUS,
      MainStatusMap.ANEMO_DMG_BONUS,
      MainStatusMap.ELECTRO_DMG_BONUS,
      MainStatusMap.DENDRO_DMG_BONUS,
      MainStatusMap.CRYO_DMG_BONUS,
      MainStatusMap.GEO_DMG_BONUS,
      MainStatusMap.PHYSICAL_DMG_BONUS,
      MainStatusMap.ATK_PER,
      MainStatusMap.HP_PER,
      MainStatusMap.DEF_PER,
      MainStatusMap.ELEMENTAL_MASTERY,
    ],
  },
  CIRCLET: {
    id: "CIRCLET",
    name: ArtifactType.CIRCLET,
    main: [
      MainStatusMap.CRIT_RATE,
      MainStatusMap.CRIT_DAMAGE,
      MainStatusMap.HEALING_BONUS,
      MainStatusMap.ATK_PER,
      MainStatusMap.HP_PER,
      MainStatusMap.DEF_PER,
      MainStatusMap.ELEMENTAL_MASTERY,
    ],
  },
}

export const ArtifactTypeList = Object.values(ArtifactTypeMap)

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
  UNDETECTED: "なし",
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

export const CustomSubStatus = {
  CRIT_RATE: "会心率",
  CRIT_DAMAGE: "会心ダメージ",
  ATK_PER: "攻撃力%",
  ENERGY_RECHARGE: "元素チャージ効率",
  DEF_PER: "防御力%",
  HP_PER: "HP%",
  ELEMENTAL_MASTERY: "元素熟知",
} as const

export const CustomSubStatusMap: SubStatusBuildMap = {
  CRIT_RATE: {
    id: "CRIT_RATE",
    name: CustomSubStatus.CRIT_RATE,
    short: "会心率",
    value: 2,
  },
  CRIT_DAMAGE: {
    id: "CRIT_DAMAGE",
    name: CustomSubStatus.CRIT_DAMAGE,
    short: "会心ダメージ",
    value: 1,
  },
  ATK_PER: {
    id: "ATK_PER",
    name: CustomSubStatus.ATK_PER,
    short: "攻撃%",
    value: 0,
  },
  ENERGY_RECHARGE: {
    id: "ENERGY_RECHARGE",
    name: CustomSubStatus.ENERGY_RECHARGE,
    short: "チャージ",
    value: 0,
  },
  DEF_PER: {
    id: "DEF_PER",
    name: CustomSubStatus.DEF_PER,
    short: "防御%",
    value: 0,
  },
  HP_PER: {
    id: "HP_PER",
    name: CustomSubStatus.HP_PER,
    short: "HP%",
    value: 0,
  },
  ELEMENTAL_MASTERY: {
    id: "ELEMENTAL_MASTERY",
    name: CustomSubStatus.ELEMENTAL_MASTERY,
    short: "熟知",
    value: 0,
  },
}

export const CustomSubStatusList: CustomSubStatusData[] =
  Object.values(CustomSubStatusMap)

export const CalcModeBuildMap: {
  [key in Exclude<CalcModeData["id"], "CUSTOM">]: SubStatusBuildMap
} = {
  CRIT: {
    ...CustomSubStatusMap,
    ATK_PER: {
      ...CustomSubStatusMap.ATK_PER,
      value: 1,
    },
  },
  ENERGY_RECHARGE: {
    ...CustomSubStatusMap,
    ENERGY_RECHARGE: {
      ...CustomSubStatusMap.ENERGY_RECHARGE,
      value: 1,
    },
  },
  DEF: {
    ...CustomSubStatusMap,
    DEF_PER: {
      ...CustomSubStatusMap.DEF_PER,
      value: 1,
    },
  },
  HP: {
    ...CustomSubStatusMap,
    HP_PER: {
      ...CustomSubStatusMap.HP_PER,
      value: 1,
    },
  },
  ELEMENTAL_MASTERY: {
    ...CustomSubStatusMap,
    ELEMENTAL_MASTERY: {
      ...CustomSubStatusMap.ELEMENTAL_MASTERY,
      value: 0.5,
    },
  },
}
