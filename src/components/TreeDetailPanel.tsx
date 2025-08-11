import { TreeMarkerData } from '../types/tree'
import './TreeDetailPanel.css'

interface TreeDetailPanelProps {
  tree: TreeMarkerData | null
  isOpen: boolean
  onClose: () => void
}

const TreeDetailPanel = ({ tree, isOpen, onClose }: TreeDetailPanelProps) => {
  if (!tree) return null

  return (
    <div className={`tree-detail-panel ${isOpen ? 'open' : ''}`}>
      <div className="panel-header">
        <h2>樹木詳細情報</h2>
        <button className="close-button" onClick={onClose}>
          ✕
        </button>
      </div>
      <div className="panel-content">
        <div className="detail-section">
          <h3>基本情報</h3>
          <div className="detail-item">
            <label>樹種名:</label>
            <span>{tree.species}</span>
          </div>
          <div className="detail-item">
            <label>健康度:</label>
            <span>{tree.health}</span>
          </div>
          <div className="detail-item">
            <label>管理番号:</label>
            <span>{tree.managementNumber}</span>
          </div>
        </div>

        <div className="detail-section">
          <h3>サイズ情報</h3>
          <div className="detail-item">
            <label>樹高:</label>
            <span>{tree.height}m</span>
          </div>
          <div className="detail-item">
            <label>幹周:</label>
            <span>{tree.circumference}m</span>
          </div>
          <div className="detail-item">
            <label>胸高直径:</label>
            <span>{tree.diameter}cm</span>
          </div>
        </div>

        <div className="detail-section">
          <h3>所在地情報</h3>
          <div className="detail-item">
            <label>行政区画:</label>
            <span>{tree.administrativeArea}</span>
          </div>
          <div className="detail-item">
            <label>町名:</label>
            <span>{tree.townName}</span>
          </div>
          <div className="detail-item">
            <label>住所:</label>
            <span>{tree.address}</span>
          </div>
          <div className="detail-item">
            <label>区画名:</label>
            <span>{tree.district}</span>
          </div>
        </div>

        <div className="detail-section">
          <h3>座標情報</h3>
          <div className="detail-item">
            <label>緯度:</label>
            <span>{tree.latitude.toFixed(6)}</span>
          </div>
          <div className="detail-item">
            <label>経度:</label>
            <span>{tree.longitude.toFixed(6)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TreeDetailPanel