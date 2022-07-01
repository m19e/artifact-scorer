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
      <div className="py-2 px-4 sm:py-4 sm:px-6 stat">
        <div className="text-sm sm:text-base stat-title">聖遺物スコア</div>
        <div className="text-3xl sm:text-4xl stat-value">
          {score.toFixed(1)}
          <span className={className + " -mx-1 sm:-mx-0"}>【{rate}】</span>
        </div>
        <div className="text-right stat-desc">{calc}</div>
      </div>
    </div>
  )
}
