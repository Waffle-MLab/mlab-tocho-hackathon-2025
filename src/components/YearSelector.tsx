import { useState, useEffect, useCallback, useRef } from 'react'
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
  const yearButtonsRef = useRef<HTMLDivElement>(null)

  // 選択された年代を中央に表示する関数
  const scrollToYear = useCallback((year: number) => {
    if (!yearButtonsRef.current) return
    
    const yearButton = yearButtonsRef.current.querySelector(`[data-year="${year}"]`) as HTMLElement
    if (!yearButton) return
    
    const container = yearButtonsRef.current
    const containerWidth = container.clientWidth
    const buttonLeft = yearButton.offsetLeft
    const buttonWidth = yearButton.offsetWidth
    
    // ボタンを中央に配置するためのスクロール位置を計算
    const scrollLeft = buttonLeft - (containerWidth / 2) + (buttonWidth / 2)
    
    container.scrollTo({
      left: scrollLeft,
      behavior: 'smooth'
    })
  }, [])

  const nextYear = useCallback(() => {
    const currentIndex = years.indexOf(selectedYear)
    const nextIndex = (currentIndex + 1) % years.length
    const nextYearValue = years[nextIndex]
    onYearChange(nextYearValue)
    // アニメーション中は選択年代を見えるようにスクロール
    setTimeout(() => scrollToYear(nextYearValue), 100)
  }, [years, selectedYear, onYearChange, scrollToYear])

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
        
        <div className="year-buttons" ref={yearButtonsRef}>
          {years.map((year) => (
            <button
              key={year}
              data-year={year}
              className={`year-button ${selectedYear === year ? 'active' : ''}`}
              onClick={() => {
                setIsPlaying(false)
                onYearChange(year)
                scrollToYear(year)
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