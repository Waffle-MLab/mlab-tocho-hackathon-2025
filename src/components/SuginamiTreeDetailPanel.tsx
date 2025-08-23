import { useState } from 'react'
import { TimeSeriesTreeMarkerData } from '../types/tree'
import './TimeSeriesTreeDetailPanel.css'

interface SuginamiTreeDetailPanelProps {
  tree: TimeSeriesTreeMarkerData | null
  isOpen: boolean
  onClose: () => void
}

const SuginamiTreeDetailPanel = ({ tree, isOpen, onClose }: SuginamiTreeDetailPanelProps) => {
  const [expandedSections, setExpandedSections] = useState({
    suginamiOffice: false
  })

  if (!tree) return null

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  // Parse notes to extract facility type
  const notesParts = tree.notes?.split(' - ') || []
  const facilityType = notesParts[0] || ''
  const additionalNotes = notesParts.slice(1).join(' - ') || '特になし'

  return (
    <div className={`tree-detail-panel ${isOpen ? 'open' : ''}`}>
      <div className="panel-header">
        <h2>樹木詳細情報</h2>
        <button className="close-button" onClick={onClose}>
          ✕
        </button>
      </div>
      <div className="panel-content">
        {/* 基本情報セクション */}
        <div className="detail-section">
          <h3>基本情報（{tree.year}年）</h3>
          <div className="detail-item">
            <label>樹木ID:</label>
            <span>{tree.treeId}</span>
          </div>
          <div className="detail-item">
            <label>緯度:</label>
            <span>{tree.latitude.toFixed(6)}</span>
          </div>
          <div className="detail-item">
            <label>経度:</label>
            <span>{tree.longitude.toFixed(6)}</span>
          </div>

          {/* 杉並区役所 都市整備部 土木管理課 情報 - 折りたたみ可能 */}
          <div className="collapsible-section">
            <button 
              className="section-toggle" 
              onClick={() => toggleSection('suginamiOffice')}
              aria-expanded={expandedSections.suginamiOffice}
            >
              <span className={`toggle-icon ${expandedSections.suginamiOffice ? 'expanded' : ''}`}>▶</span>
              杉並区役所 都市整備部 土木管理課
            </button>
            {expandedSections.suginamiOffice && (
              <div className="collapsible-content">
                <div className="detail-item">
                  <label>番号:</label>
                  <span>{tree.number}</span>
                </div>
                <div className="detail-item">
                  <label>樹種名:</label>
                  <span>{tree.species}</span>
                </div>
                <div className="detail-item">
                  <label>立地:</label>
                  <span>{tree.location}</span>
                </div>
                <div className="detail-item">
                  <label>施設区分:</label>
                  <span>{facilityType}</span>
                </div>
                <div className="detail-item">
                  <label>状態:</label>
                  <span className={`condition-${tree.condition.replace(/[\s・]/g, '').toLowerCase()}`}>
                    {tree.condition}
                  </span>
                </div>
                <div className="detail-item">
                  <label>備考:</label>
                  <span>{additionalNotes}</span>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}

export default SuginamiTreeDetailPanel