import './ZoomControls.css'
import { getGlobalMapInstance } from '../utils/mapInstance'

interface ZoomControlsProps {
  isExpanded: boolean
}

const ZoomControls = ({ isExpanded }: ZoomControlsProps) => {
  const handleZoomIn = () => {
    const mapInstance = getGlobalMapInstance()
    if (mapInstance && mapInstance.zoomIn) {
      mapInstance.zoomIn()
    }
  }

  const handleZoomOut = () => {
    const mapInstance = getGlobalMapInstance()
    if (mapInstance && mapInstance.zoomOut) {
      mapInstance.zoomOut()
    }
  }

  const handleResetZoom = () => {
    const mapInstance = getGlobalMapInstance()
    if (mapInstance && mapInstance.setView) {
      mapInstance.setView([35.6718, 139.5503], 16)
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