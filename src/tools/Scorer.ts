import type {
  SubStatusData,
  SubStatusID,
  MainStatusID,
  SubStatusBuildMap,
} from "@/types/Scorer"
import { SubStatus } from "@/consts/Scorer"

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
const getParamValue = (label: string): number => {
  const trim = +label.replace("%", "")
  if (Number.isNaN(trim)) return 0
  return +(Math.trunc(trim * 10) / 10).toFixed(1)
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

export const getSubStatusDatas = (text: string): SubStatusData[] => {
  return text
    .split("\n")
    .filter((l) => Boolean(l))
    .map((l) => getSubStatusData(l.replace(/\s/g, "")))
}

export const updateSubStatusByID = ({
  id,
  src,
}: {
  id: SubStatusID
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

export const getArtifactScore = ({
  datas,
  build,
}: {
  datas: SubStatusData[]
  build: SubStatusBuildMap
}): number => {
  return datas
    .filter(({ param }) => !Number.isNaN(param.value))
    .map(({ id, param }) => {
      if (
        id === "ATK_FLAT" ||
        id === "DEF_FLAT" ||
        id === "HP_FLAT" ||
        id === "UNDETECTED"
      ) {
        return 0
      }
      return param.value * build[id].value
    })
    .reduce((sum, elem) => sum + elem, 0)
}

export const getScoreRateProps = (
  score: number
): { rate: string; className: string } => {
  if (score >= 45) {
    return { rate: "SS", className: "text-error" }
  }
  if (score >= 35) {
    return { rate: "S", className: "text-warning" }
  }
  if (score >= 25) {
    return { rate: "A", className: "text-primary" }
  }
  return { rate: "B", className: "text-info" }
}

export const getMainIsPercent = (id: MainStatusID) => {
  return !["ATK_FLAT", "HP_FLAT", "ELEMENTAL_MASTERY"].includes(id)
}
