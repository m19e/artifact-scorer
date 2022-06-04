import type { VFC } from "react"
import type { CalcModeName } from "@/types/Scorer"

const getScoreRateProps = (
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
          <span className={className}>【{rate}】</span>
        </div>
        <div className="pt-1 text-right stat-desc">{calc}</div>
      </div>
    </div>
  )
}
