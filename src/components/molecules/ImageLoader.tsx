import Image from "next/image"
import { useState } from "react"
import type { FC } from "react"

import { RectCropper } from "@/components/molecules/RectCropper"
import { Dropzone } from "@/components/molecules/Dropzone"
import type { Props as CropperProps } from "@/components/molecules/RectCropper"
import type { Props as DropzoneProps } from "@/components/molecules/Dropzone"

type Props = DropzoneProps &
  CropperProps & {
    onReset: () => void
  }

export const ImageLoader: FC<Props> = ({ url, onDrop, onCrop, onReset }) => {
  const [collapseOpen, setCollapseOpen] = useState(true)
  const collapseStatus = collapseOpen ? "collapse-open" : "collapse-close"

  const toggleCollapse = () => setCollapseOpen((prev) => !prev)

  return (
    <div tabIndex={0} className={`image-loader ${collapseStatus}`}>
      <div
        className="text-lg font-medium text-base-content collapse-title"
        onClick={toggleCollapse}
      >
        画像読み込み
      </div>
      <div className="text-base-content collapse-content">
        {url ? (
          <div className="overflow-hidden relative flex-1 h-80 rounded-box bg-base-300">
            <div className="absolute top-1 left-1 z-10">
              <Hint />
            </div>
            <div className="absolute top-1 right-1 z-10">
              <div className="flex justify-center items-center w-9 h-9 bg-base-100 rounded-box">
                <button
                  className="btn btn-sm btn-square rounded-box"
                  onClick={onReset}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <RectCropper url={url} onCrop={onCrop} />
          </div>
        ) : (
          <Dropzone onDrop={onDrop} />
        )}
      </div>
    </div>
  )
}

const Hint = () => {
  return (
    <div className="h-6 bg-white rounded-box dropdown">
      <label
        tabIndex={0}
        className="text-blue-600 btn btn-circle btn-ghost btn-xs"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
            clipRule="evenodd"
          />
        </svg>
      </label>
      <div
        tabIndex={0}
        className="w-56 shadow-xl sm:w-72 card dropdown-content bg-base-100"
      >
        <div className="p-4 card-body">
          <h2 className="text-base card-title">
            サブステータスを範囲選択してください
          </h2>
          <p className="text-xs">トリミング例:</p>
          <figure>
            <Image
              width={300}
              height={160}
              src="/trimming-example.png"
              alt="トリミング例"
            />
          </figure>
        </div>
      </div>
    </div>
  )
}
