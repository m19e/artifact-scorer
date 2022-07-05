import type { FC } from "react"

import type { ArtifactState, ArtifactAction } from "@/hooks/Scorer"
import { MainStatusMap } from "@/consts/Scorer"
import { getMainIsPercent } from "@/tools/Scorer"

import { ArtifactTypeSelect } from "@/components/atoms/Select/Artifact/Type"
import { ArtifactMainSelect } from "@/components/atoms/Select/Artifact/Main"
import { RarityRating } from "@/components/atoms/RarityRating"
import { ArtifactScoreBox } from "@/components/atoms/ArtifactScoreBox"

type Props = Pick<
  ArtifactState,
  "artTypeID" | "mainType" | "score" | "calcMode"
> & {
  onSelectType: ArtifactAction["setArtTypeID"]
  onSelectMain: ArtifactAction["setMainType"]
}

export const ArtifactEditorHero: FC<Props> = ({
  artTypeID,
  mainType,
  score,
  calcMode,
  onSelectType,
  onSelectMain,
}) => {
  return (
    <div className="h-36 sm:h-44 artifact-hero">
      <div className="flex justify-between h-full">
        <div className="flex flex-col justify-between ml-6">
          <div className="mt-1">
            <ArtifactTypeSelect
              defaultValue={artTypeID}
              onSelect={onSelectType}
            />
          </div>
          <div className="flex flex-col">
            <div className="-ml-0.5">
              <ArtifactMainSelect
                type={artTypeID}
                defaultValue={mainType}
                onSelect={onSelectMain}
              />
            </div>
            <span className="text-3xl leading-6 text-white sm:text-4xl sm:leading-7 font-renner">
              {MainStatusMap[mainType].max}
              {getMainIsPercent(mainType) ? "%" : ""}
            </span>
            <div className="my-1.5 sm:my-2.5">
              <RarityRating />
            </div>
          </div>
        </div>
        <div className="flex flex-col justify-center mr-4">
          <ArtifactScoreBox score={score} calc={calcMode.name} />
        </div>
      </div>
    </div>
  )
}
