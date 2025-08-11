import { useState, useEffect, useCallback } from 'react'
import './YearSelector.css'

interface YearSelectorProps {
  years: number[]
  selectedYear: number
  onYearChange: (year: number) => void
  loading?: boolean
}

const YearSelector = ({ years, selectedYear, onYearChange, loading }: YearSelectorProps) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1000) // milliseconds

  const nextYear = useCallback(() => {
    const currentIndex = years.indexOf(selectedYear)
    const nextIndex = (currentIndex + 1) % years.length
    onYearChange(years[nextIndex])
  }, [years, selectedYear, onYearChange])

  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(nextYear, playbackSpeed)
    return () => clearInterval(interval)
  }, [isPlaying, playbackSpeed, nextYear])

  const togglePlayback = () => {
    setIsPlaying(!isPlaying)
  }

  const resetToStart = () => {
    setIsPlaying(false)
    onYearChange(years[0])
  }

  if (years.length === 0) return null

  return (
    <div className="year-selector">
      <div className="year-selector-container">
        <div className="playback-controls">
          <button 
            className="control-button reset" 
            onClick={resetToStart}
            disabled={loading}
            title="最初に戻る"
          >
            ◀◀
          </button>
          <button 
            className={`control-button play ${isPlaying ? 'playing' : ''}`}
            onClick={togglePlayback}
            disabled={loading}
            title={isPlaying ? '停止' : '再生'}
          >
            {isPlaying ? '■' : '▶'}
          </button>
          <select 
            className="speed-selector"
            value={playbackSpeed}
            onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
            disabled={loading}
          >
            <option value={2000}>0.5x</option>
            <option value={1000}>1x</option>
            <option value={500}>2x</option>
            <option value={250}>4x</option>
          </select>
        </div>
        
        <div className="year-buttons">
          {years.map((year) => (
            <button
              key={year}
              className={`year-button ${selectedYear === year ? 'active' : ''}`}
              onClick={() => {
                setIsPlaying(false)
                onYearChange(year)
              }}
              disabled={loading}
            >
              {year}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default YearSelector