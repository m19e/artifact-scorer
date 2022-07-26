import type { FC } from "react"

import type { ArtifactState, ArtifactAction } from "@/hooks/Scorer"

import { CustomBuildEditor } from "@/components/molecules/CustomBuildEditor"
import { ArtifactEditorHero } from "@/components/molecules/ArtifactEditor/Hero"
import { SubStatusEditorList } from "@/components/molecules/SubStatusEditorList"
import { CalcModeSelect } from "@/components/atoms/Select/CalcMode"
import { ArtifactSetSelect } from "@/components/atoms/Select/Artifact/Set"
import { TwitterShareButton } from "@/components/atoms/TwitterShareButton"

type Props = ArtifactState & ArtifactAction

export const ArtifactEditor: FC<Props> = ({
  artSetID,
  artTypeID,
  mainType,
  score,
  calcMode,
  artifact,
  substats,
  custom,
  setCalcType,
  setArtSetID,
  setArtTypeID,
  setMainType,
  setCustom,
  updateSubStat,
}) => {
  return (
    <div className="flex flex-col gap-2">
      <CalcModeSelect onSelect={setCalcType} />
      <CustomBuildEditor
        calcMode={calcMode}
        custom={custom}
        setCustom={setCustom}
      />
      <div className="flex flex-col">
        <div className="flex items-center h-10 sm:h-12 artifact-heading">
          <div className="ml-5 sm:ml-6">
            <ArtifactSetSelect defaultValue={artSetID} onSelect={setArtSetID} />
          </div>
        </div>
        <ArtifactEditorHero
          artTypeID={artTypeID}
          mainType={mainType}
          score={score}
          calcMode={calcMode}
          onSelectType={setArtTypeID}
          onSelectMain={setMainType}
        />
        <div className="flex flex-col gap-2 py-3 bg-orange-100">
          <div className="flex justify-between items-center px-4">
            <div className="pr-1 pl-0.5 h-6 bg-slate-700 rounded">
              <span className="text-xl font-black leading-5 text-white">
                +20
              </span>
            </div>
            <TwitterShareButton
              artifact={artifact}
              calcMode={calcMode}
              custom={custom}
            />
          </div>
          <div className="pr-4 pl-3.5">
            <SubStatusEditorList subs={substats} onUpdate={updateSubStat} />
          </div>
        </div>
      </div>
    </div>
  )
}
