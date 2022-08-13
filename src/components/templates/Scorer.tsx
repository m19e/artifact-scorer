import { ArtifactScorer } from "@/components/organisms/ArtifactScorer"
import { Header } from "@/components/molecules/Header"
import { Footer } from "@/components/atoms/Footer"

const Scorer = () => {
  return (
    <div className="flex flex-col items-center min-h-screen bg-base-200">
      <Header />
      <ArtifactScorer />
      <Footer />
    </div>
  )
}

export default Scorer
