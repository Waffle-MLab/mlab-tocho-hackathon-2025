import { useState } from 'react'
import './DistanceControl.css'

interface DistanceControlProps {
  distance: number
  onDistanceChange: (distance: number) => void
  overlapThreshold?: number
  onOverlapThresholdChange?: (threshold: number) => void
}

const DistanceControl = ({ 
  distance, 
  onDistanceChange, 
  overlapThreshold = 0.3, 
  onOverlapThresholdChange 
}: DistanceControlProps) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const presetDistances = [1, 5, 10, 25, 50, 100]

  return (
    <div className={`distance-control ${isExpanded ? 'expanded' : ''}`}>
      <div className="control-header" onClick={() => setIsExpanded(!isExpanded)}>
        <span className="control-title">円形クラスター範囲</span>
        <span className="control-toggle">{isExpanded ? '−' : '+'}</span>
      </div>
      
      {isExpanded && (
        <div className="control-content">
          <div className="current-distance">
            <span className="distance-label">円の半径: {distance}m</span>
          </div>
          
          <div className="distance-slider">
            <input
              type="range"
              min="1"
              max="200"
              step="1"
              value={distance}
              onChange={(e) => onDistanceChange(Number(e.target.value))}
              className="slider"
            />
            <div className="slider-labels">
              <span>1m</span>
              <span>200m</span>
            </div>
          </div>
          
          <div className="preset-buttons">
            <div className="preset-label">プリセット:</div>
            <div className="preset-grid">
              {presetDistances.map((preset) => (
                <button
                  key={preset}
                  className={`preset-button ${distance === preset ? 'active' : ''}`}
                  onClick={() => onDistanceChange(preset)}
                >
                  {preset}m
                </button>
              ))}
            </div>
          </div>
          
          {onOverlapThresholdChange && (
            <div className="overlap-threshold-control">
              <div className="preset-label">結合感度:</div>
              <div className="threshold-display">
                <span className="threshold-label">
                  {Math.round(overlapThreshold * 100)}% 重なりで結合
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.8"
                step="0.1"
                value={overlapThreshold}
                onChange={(e) => onOverlapThresholdChange(Number(e.target.value))}
                className="slider"
              />
              <div className="slider-labels">
                <span>厳しい</span>
                <span>緩い</span>
              </div>
            </div>
          )}
          
          <div className="algorithm-info">
            <div className="info-text">
              <strong>円形範囲結合:</strong><br/>
              各問題樹木を中心とした円が{Math.round(overlapThreshold * 100)}%以上重なった場合に結合し、健全な樹木がある部分は除外します
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DistanceControl