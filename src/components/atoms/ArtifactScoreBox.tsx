import type { VFC } from "react"
import type { CalcModeName } from "@/types/Scorer"
import { getScoreRateProps } from "@/tools/Scorer"

interface Props {
  score: number
  calc: CalcModeName
}

export const ArtifactScoreBox: VFC<Props> = ({ score, calc }) => {
  const { rate, className } = getScoreRateProps(score)

  return (
    <div className="shadow stats">
      <div className="stat">
        <div className="stat-title">聖遺物スコア</div>
        <div className="stat-value">
          {score.toFixed(1)}
          <span className={className + " zen-maru-gothic"}> {rate}</span>
        </div>
        <div className="text-right stat-desc">{calc}</div>
      </div>
    </div>
  )
}
