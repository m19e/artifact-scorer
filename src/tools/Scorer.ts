import type { SubStatusData, CalcModeID } from "@/types/Scorer"

export const getArtifactScore = ({
  datas,
  mode,
}: {
  datas: SubStatusData[]
  mode: CalcModeID
}): number => {
  return datas
    .filter(({ param }) => !Number.isNaN(param.value))
    .map(({ id, param }) => {
      switch (id) {
        case "CRIT_RATE":
          return param.value * 2

        case "CRIT_DAMAGE":
          return param.value

        case "ATK_PER":
          if (mode === "CRIT") {
            return param.value
          }
          return 0

        case "ENERGY_RECHARGE":
          if (mode === "ENERGY_RECHARGE") {
            return param.value
          }
          return 0

        case "DEF_PER":
          if (mode === "DEF") {
            return param.value
          }
          return 0

        case "HP_PER":
          if (mode === "HP") {
            return param.value
          }
          return 0

        case "ELEMENTAL_MASTERY":
          if (mode === "ELEMENTAL_MASTERY") {
            return param.value / 2
          }
          return 0

        default:
          return 0
      }
    })
    .reduce((sum, elem) => sum + elem, 0)
}
