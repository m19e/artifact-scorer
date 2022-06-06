import { useState, useCallback } from "react"
import type { VFC } from "react"
import type { Rectangle } from "tesseract.js"
import ReactEasyCrop from "react-easy-crop"
import type { Area, Point } from "react-easy-crop/types"

interface Props {
  url: string
  onCrop: (rect: Rectangle) => void
}

export const RectCropper: VFC<Props> = ({ url, onCrop }) => {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)

  const handleCropComplete = useCallback(
    (_: Area, area: Area) => {
      const { x: left, y: top, width, height } = area
      onCrop({ left, top, width, height })
    },
    [onCrop]
  )

  return (
    <div className="relative w-full h-full">
      <ReactEasyCrop
        image={url}
        crop={crop}
        zoom={zoom}
        aspect={2 / 1}
        zoomSpeed={1 / 5}
        maxZoom={5}
        onCropChange={setCrop}
        onZoomChange={setZoom}
        onCropComplete={handleCropComplete}
      />
    </div>
  )
}
