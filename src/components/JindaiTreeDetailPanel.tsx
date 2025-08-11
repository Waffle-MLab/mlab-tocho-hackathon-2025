import { JindaiTreeMarkerData } from '../types/tree'
import './TreeDetailPanel.css'

interface JindaiTreeDetailPanelProps {
  tree: JindaiTreeMarkerData | null
  isOpen: boolean
  onClose: () => void
}

const JindaiTreeDetailPanel = ({ tree, isOpen, onClose }: JindaiTreeDetailPanelProps) => {
  if (!tree) return null

  return (
    <div className={`tree-detail-panel ${isOpen ? 'open' : ''}`}>
      <div className="panel-header">
        <h2>樹木詳細情報（神代植物公園）</h2>
        <button className="close-button" onClick={onClose}>
          ✕
        </button>
      </div>
      <div className="panel-content">
        <div className="detail-section">
          <h3>基本情報</h3>
          <div className="detail-item">
            <label>番号:</label>
            <span>{tree.number}</span>
          </div>
          <div className="detail-item">
            <label>樹木ID:</label>
            <span>{tree.treeId}</span>
          </div>
          <div className="detail-item">
            <label>樹種名:</label>
            <span>{tree.species}</span>
          </div>
          <div className="detail-item">
            <label>状態:</label>
            <span>{tree.condition}</span>
          </div>
        </div>

        <div className="detail-section">
          <h3>サイズ情報</h3>
          <div className="detail-item">
            <label>樹高:</label>
            <span>{tree.height}m</span>
          </div>
          <div className="detail-item">
            <label>木の周囲:</label>
            <span>{tree.circumference}cm</span>
          </div>
        </div>

        <div className="detail-section">
          <h3>位置情報</h3>
          <div className="detail-item">
            <label>立地:</label>
            <span>{tree.location}</span>
          </div>
          <div className="detail-item">
            <label>緯度:</label>
            <span>{tree.latitude.toFixed(6)}</span>
          </div>
          <div className="detail-item">
            <label>経度:</label>
            <span>{tree.longitude.toFixed(6)}</span>
          </div>
        </div>

        <div className="detail-section">
          <h3>備考</h3>
          <div className="detail-item">
            <label>備考:</label>
            <span>{tree.notes || '特になし'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default JindaiTreeDetailPanel