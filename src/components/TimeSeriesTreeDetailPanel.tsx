import { useState } from 'react'
import { TimeSeriesTreeMarkerData } from '../types/tree'
import './TimeSeriesTreeDetailPanel.css'

interface TimeSeriesTreeDetailPanelProps {
  tree: TimeSeriesTreeMarkerData | null
  isOpen: boolean
  onClose: () => void
}

const TimeSeriesTreeDetailPanel = ({ tree, isOpen, onClose }: TimeSeriesTreeDetailPanelProps) => {
  const [expandedSections, setExpandedSections] = useState({
    parkInfo: false,
    tokyoParks: false,
    sampleUniversity: false
  })
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  if (!tree) return null

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  // サンプルデータ - 実際は樹木IDベースで履歴を取得
  const timelineData = [
    { 
      date: '2022-04-15', 
      action: '植樹', 
      details: '初回植栽、土壌改良実施',
      photos: ['/images/sample1.jpg', '/images/sample1.jpg']
    },
    { 
      date: '2023-06-20', 
      action: '剪定', 
      details: '枝払い、形状整理',
      photos: ['/images/sample1.jpg']
    },
    { 
      date: '2024-08-10', 
      action: '病害対応', 
      details: '防虫剤散布、栄養補給',
      photos: ['/images/sample1.jpg', '/images/sample1.jpg', '/images/sample1.jpg']
    },
    { 
      date: '2025-01-12', 
      action: '健康診断', 
      details: '定期検査、状態確認',
      photos: ['/images/sample1.jpg']
    }
  ]

  // サンプルチャットデータ
  const chatHistory = [
    { user: '田中', message: 'この樹木の状態が気になります', time: '2025-01-10 14:30' },
    { user: '佐藤', message: '先月剪定を行いました。経過観察が必要です', time: '2025-01-10 15:15' },
    { user: '田中', message: '了解しました。来月再度確認します', time: '2025-01-10 15:20' }
  ]

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

          {/* 神代植物公園情報 - 折りたたみ可能 */}
          <div className="collapsible-section">
            <button 
              className="section-toggle" 
              onClick={() => toggleSection('parkInfo')}
              aria-expanded={expandedSections.parkInfo}
            >
              <span className={`toggle-icon ${expandedSections.parkInfo ? 'expanded' : ''}`}>▶</span>
              神代植物公園管理部
            </button>
            {expandedSections.parkInfo && (
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
                  <label>木の周囲:</label>
                  <span>{tree.circumference}cm</span>
                </div>
                <div className="detail-item">
                  <label>樹高:</label>
                  <span>{tree.height}m</span>
                </div>
                <div className="detail-item">
                  <label>状態:</label>
                  <span className={`condition-${tree.condition.replace(/[\s・]/g, '').toLowerCase()}`}>
                    {tree.condition}
                  </span>
                </div>
                <div className="detail-item">
                  <label>備考:</label>
                  <span>{tree.notes || '特になし'}</span>
                </div>

                {/* 管理履歴 - 神代植物公園グループ内 */}
                <div className="management-history">
                  <h4>管理履歴</h4>
                  
                  {/* 対応タイムライン */}
                  <h5>作業記録</h5>
                  <div className="timeline">
                    {timelineData.map((item, index) => {
                      const date = new Date(item.date)
                      const formattedDate = `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`
                      
                      return (
                        <div key={index} className="timeline-item">
                          <div className="timeline-marker">
                            <div className="timeline-dot"></div>
                            <div className="timeline-date">{formattedDate}</div>
                          </div>
                          <div className="timeline-content">
                            <div className="timeline-action">{item.action}</div>
                            <div className="timeline-details">{item.details}</div>
                            {item.photos && item.photos.length > 0 && (
                              <div className="timeline-photos">
                                {item.photos.map((photo, photoIndex) => (
                                  <img 
                                    key={photoIndex}
                                    src={photo}
                                    alt={`${item.action} - 写真 ${photoIndex + 1}`}
                                    className="photo-thumbnail"
                                    onClick={() => setSelectedImage(photo)}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* チャット履歴 */}
                  <h5>担当者チャット</h5>
                  <div className="chat-history">
                    {chatHistory.map((chat, index) => (
                      <div key={index} className="chat-item">
                        <div className="chat-avatar">
                          <div className="avatar-circle">{chat.user.charAt(0)}</div>
                        </div>
                        <div className="chat-content">
                          <div className="chat-header">
                            <span className="chat-user">{chat.user}</span>
                            <span className="chat-time">{chat.time}</span>
                          </div>
                          <div className="chat-bubble">
                            <p className="chat-message">{chat.message}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* チャット入力 */}
                  <div className="chat-input-container">
                    <div className="chat-input-wrapper">
                      <input 
                        type="text" 
                        className="chat-input" 
                        placeholder="メッセージを入力..."
                        disabled
                      />
                      <button className="chat-send-button" disabled>
                        送信
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 公益財団法人東京都公園協会 - 折りたたみ可能 */}
          <div className="collapsible-section">
            <button 
              className="section-toggle" 
              onClick={() => toggleSection('tokyoParks')}
              aria-expanded={expandedSections.tokyoParks}
            >
              <span className={`toggle-icon ${expandedSections.tokyoParks ? 'expanded' : ''}`}>▶</span>
              公益財団法人東京都公園協会
            </button>
            {expandedSections.tokyoParks && (
              <div className="collapsible-content">
                {/* 今後追加予定 */}
              </div>
            )}
          </div>

          {/* サンプル大学調査委員会 - 折りたたみ可能 */}
          <div className="collapsible-section">
            <button 
              className="section-toggle" 
              onClick={() => toggleSection('sampleUniversity')}
              aria-expanded={expandedSections.sampleUniversity}
            >
              <span className={`toggle-icon ${expandedSections.sampleUniversity ? 'expanded' : ''}`}>▶</span>
              サンプル大学調査委員会
            </button>
            {expandedSections.sampleUniversity && (
              <div className="collapsible-content">
                {/* 今後追加予定 */}
              </div>
            )}
          </div>

        </div>
      </div>
      
      {/* 写真モーダル */}
      {selectedImage && (
        <div className="photo-modal" onClick={() => setSelectedImage(null)}>
          <div className="photo-modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="photo-modal-close" 
              onClick={() => setSelectedImage(null)}
            >
              ✕
            </button>
            <img 
              src={selectedImage} 
              alt="拡大写真" 
              className="photo-modal-image"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default TimeSeriesTreeDetailPanel