import './ZoomControls.css'

interface ZoomControlsProps {
  isExpanded: boolean
}

// グローバルなマップ参照を作成
let globalMapInstance: any = null

// Mapコンポーネントからマップインスタンスをセットするためのヘルパー
export const setGlobalMapInstance = (mapInstance: any) => {
  globalMapInstance = mapInstance
}

const ZoomControls = ({ isExpanded }: ZoomControlsProps) => {
  const handleZoomIn = () => {
    if (globalMapInstance && globalMapInstance.zoomIn) {
      globalMapInstance.zoomIn()
    }
  }

  const handleZoomOut = () => {
    if (globalMapInstance && globalMapInstance.zoomOut) {
      globalMapInstance.zoomOut()
    }
  }

  const handleResetZoom = () => {
    if (globalMapInstance && globalMapInstance.setView) {
      globalMapInstance.setView([35.6718, 139.5503], 16)
    }
  }

  return (
    <div className={`zoom-controls ${isExpanded ? 'sidebar-expanded' : ''}`}>
      <button 
        className="zoom-button zoom-in" 
        onClick={handleZoomIn}
        title="拡大"
      >
        +
      </button>
      <button 
        className="zoom-button zoom-out" 
        onClick={handleZoomOut}
        title="縮小"
      >
        −
      </button>
      <button 
        className="zoom-button zoom-reset" 
        onClick={handleResetZoom}
        title="リセット"
      >
        ⌂
      </button>
    </div>
  )
}

export default ZoomControls