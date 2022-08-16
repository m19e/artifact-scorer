import type { FC } from "react"
import type { ArtifactTypeID, CalcModeName } from "@/types/Scorer"
import { getScoreRateProps } from "@/tools/Scorer"

interface Props {
  type: ArtifactTypeID
  score: number
  calc: CalcModeName
}

export const ArtifactScoreBox: FC<Props> = ({ type, score, calc }) => {
  const { rate, className } = getScoreRateProps(type, score)

  return (
    <div className="shadow stats">
      <div className="px-4 sm:px-6 stat">
        <div className="stat-title">聖遺物スコア</div>
        <div className="stat-value font-renner">
          {score.toFixed(1)}
          <span className={className + " tracking-tighter zen-maru-gothic"}>
            {" "}
            {rate}
          </span>
        </div>
        <div className="text-right stat-desc">{calc}</div>
      </div>
    </div>
  )
}
