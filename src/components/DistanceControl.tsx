import { useState } from 'react'
import './DistanceControl.css'

interface DistanceControlProps {
  distance: number
  onDistanceChange: (distance: number) => void
}

const DistanceControl = ({ distance, onDistanceChange }: DistanceControlProps) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const presetDistances = [50, 100, 150, 200, 300, 500]

  return (
    <div className={`distance-control ${isExpanded ? 'expanded' : ''}`}>
      <div className="control-header" onClick={() => setIsExpanded(!isExpanded)}>
        <span className="control-title">枯死クラスター設定</span>
        <span className="control-toggle">{isExpanded ? '−' : '+'}</span>
      </div>
      
      {isExpanded && (
        <div className="control-content">
          <div className="current-distance">
            <span className="distance-label">現在: {distance}m</span>
          </div>
          
          <div className="distance-slider">
            <input
              type="range"
              min="10"
              max="1000"
              step="10"
              value={distance}
              onChange={(e) => onDistanceChange(Number(e.target.value))}
              className="slider"
            />
            <div className="slider-labels">
              <span>10m</span>
              <span>1000m</span>
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
        </div>
      )}
    </div>
  )
}

export default DistanceControl