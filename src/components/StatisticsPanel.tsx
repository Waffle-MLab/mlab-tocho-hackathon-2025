import { useState, useMemo, useRef, useEffect } from 'react'
import { TimeSeriesTreeMarkerData } from '../types/tree'
import './StatisticsPanel.css'

interface StatisticsPanelProps {
  trees: TimeSeriesTreeMarkerData[]
  availableYears: number[]
  selectedYear: number
  allTreesInViewport?: TimeSeriesTreeMarkerData[]
}

interface YearlyStats {
  year: number
  total: number
  healthy: number
  needsObservation: number
  pestDamage: number
  withering: number
  dead: number
  brokenBranch: number
  healthyRate: number
  problemRate: number
}

const StatisticsPanel = ({ trees, availableYears, selectedYear, allTreesInViewport }: StatisticsPanelProps) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart')


  // Calculate yearly statistics - use viewport-filtered data if available
  const yearlyStats = useMemo((): YearlyStats[] => {
    const dataToUse = allTreesInViewport || trees
    return availableYears.map(year => {
      const yearTrees = dataToUse.filter(tree => tree.year === year)
      const total = yearTrees.length
      
      const conditions = yearTrees.reduce((acc, tree) => {
        acc[tree.condition] = (acc[tree.condition] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const healthy = conditions['健全'] || 0
      const needsObservation = conditions['要観察'] || 0
      const pestDamage = conditions['虫害'] || 0
      const withering = conditions['立ち枯れ'] || 0
      const dead = conditions['枯死'] || 0
      const brokenBranch = conditions['枝折れ'] || 0

      const problemTrees = pestDamage + withering + dead
      const healthyRate = total > 0 ? (healthy / total) * 100 : 0
      const problemRate = total > 0 ? (problemTrees / total) * 100 : 0

      return {
        year,
        total,
        healthy,
        needsObservation,
        pestDamage,
        withering,
        dead,
        brokenBranch,
        healthyRate,
        problemRate
      }
    })
  }, [trees, availableYears, allTreesInViewport])

  // チャートを右端（2025年）から表示するためのスクロール設定
  const chartWrapperRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    if (chartWrapperRef.current && isExpanded && viewMode === 'chart') {
      const wrapper = chartWrapperRef.current
      // 初回表示時のみ右端にスクロール
      if (wrapper.scrollLeft === 0) {
        wrapper.scrollLeft = wrapper.scrollWidth - wrapper.clientWidth
      }
    }
  }, [isExpanded, viewMode])

  // チャートホバー時の地図スクロール無効化
  const handleChartMouseEnter = () => {
    // ホバー時は地図のスクロールを無効化
    const mapElement = document.querySelector('.leaflet-container') as HTMLElement
    if (mapElement) {
      mapElement.style.pointerEvents = 'none'
    }
  }

  const handleChartMouseLeave = () => {
    // ホバー解除時は地図のスクロールを有効化
    const mapElement = document.querySelector('.leaflet-container') as HTMLElement
    if (mapElement) {
      mapElement.style.pointerEvents = 'auto'
    }
  }

  const currentStats = yearlyStats.find(stats => stats.year === selectedYear)

  return (
    <div className={`statistics-panel ${isExpanded ? 'expanded' : ''}`}>
      <div className="panel-header" onClick={() => setIsExpanded(!isExpanded)}>
        <span className="panel-title">統計情報</span>
        {currentStats && (
          <span className="quick-stats">
            問題率: {currentStats.problemRate.toFixed(1)}%
          </span>
        )}
        <span className="panel-toggle">{isExpanded ? '−' : '+'}</span>
      </div>

      {isExpanded && (
        <div className="panel-content">
          {currentStats && (
            <div className="current-stats">
              <h4>{selectedYear}年の状況</h4>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-label">総樹木数</span>
                  <span className="stat-value">{currentStats.total}</span>
                </div>
                <div className="stat-item healthy">
                  <span className="stat-label">健全</span>
                  <span className="stat-value">{currentStats.healthy}</span>
                </div>
                <div className="stat-item problem">
                  <span className="stat-label">問題樹木</span>
                  <span className="stat-value">{currentStats.pestDamage + currentStats.withering + currentStats.dead}</span>
                </div>
                <div className="stat-item rate">
                  <span className="stat-label">問題率</span>
                  <span className="stat-value">{currentStats.problemRate.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          )}

          <div className="view-controls">
            <button 
              className={`view-button ${viewMode === 'chart' ? 'active' : ''}`}
              onClick={() => setViewMode('chart')}
            >
              グラフ
            </button>
            <button 
              className={`view-button ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
            >
              表
            </button>
          </div>

          {viewMode === 'chart' && (
            <div className="chart-container">
              <h4>樹木状態の推移</h4>
              <div 
                className="chart-wrapper" 
                ref={chartWrapperRef}
                onMouseEnter={handleChartMouseEnter}
                onMouseLeave={handleChartMouseLeave}
              >
                <div className="chart">
                  <div className="chart-grid">
                    <div className="grid-line"></div>
                    <div className="grid-line"></div>
                    <div className="grid-line"></div>
                    <div className="grid-line"></div>
                    <div className="grid-line"></div>
                  </div>
                  <div className="chart-y-axis">
                    <span>100%</span>
                    <span>75%</span>
                    <span>50%</span>
                    <span>25%</span>
                    <span>0%</span>
                  </div>
                  <div className="chart-bars">
                    {yearlyStats.map((stats) => {
                      const maxHeight = 160
                      const total = stats.total
                      
                      // 積み上げ用の高さ計算（100%ベース）
                      const healthyHeight = total > 0 ? (stats.healthy / total) * maxHeight : 0
                      const observationHeight = total > 0 ? (stats.needsObservation / total) * maxHeight : 0
                      const pestHeight = total > 0 ? (stats.pestDamage / total) * maxHeight : 0
                      const witheringHeight = total > 0 ? (stats.withering / total) * maxHeight : 0
                      const deadHeight = total > 0 ? (stats.dead / total) * maxHeight : 0
                      const brokenHeight = total > 0 ? (stats.brokenBranch / total) * maxHeight : 0
                      
                      return (
                        <div key={stats.year} className="bar-container">
                          <div className="stacked-bar-group">
                            <div 
                              className="stacked-bar healthy-bar" 
                              style={{ height: `${healthyHeight}px` }}
                              title={`健全: ${stats.healthy}本`}
                            />
                            <div 
                              className="stacked-bar observation-bar" 
                              style={{ height: `${observationHeight}px` }}
                              title={`要観察: ${stats.needsObservation}本`}
                            />
                            <div 
                              className="stacked-bar pest-bar" 
                              style={{ height: `${pestHeight}px` }}
                              title={`虫害: ${stats.pestDamage}本`}
                            />
                            <div 
                              className="stacked-bar withering-bar" 
                              style={{ height: `${witheringHeight}px` }}
                              title={`立ち枯れ: ${stats.withering}本`}
                            />
                            <div 
                              className="stacked-bar dead-bar" 
                              style={{ height: `${deadHeight}px` }}
                              title={`枯死: ${stats.dead}本`}
                            />
                            <div 
                              className="stacked-bar broken-bar" 
                              style={{ height: `${brokenHeight}px` }}
                              title={`枝折れ: ${stats.brokenBranch}本`}
                            />
                          </div>
                          <div className={`bar-label ${stats.year === selectedYear ? 'current' : ''}`}>
                            {stats.year}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
              <div className="chart-legend">
                <div className="legend-item">
                  <div className="legend-color healthy"></div>
                  <span>健全</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color observation"></div>
                  <span>要観察</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color pest"></div>
                  <span>虫害</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color withering"></div>
                  <span>立ち枯れ</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color dead"></div>
                  <span>枯死</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color broken"></div>
                  <span>枝折れ</span>
                </div>
              </div>
            </div>
          )}

          {viewMode === 'table' && (
            <div className="table-container">
              <h4>年別詳細統計</h4>
              <div className="stats-table">
                <table>
                  <thead>
                    <tr>
                      <th>年</th>
                      <th>総数</th>
                      <th>健全</th>
                      <th>要観察</th>
                      <th>虫害</th>
                      <th>立枯</th>
                      <th>枯死</th>
                      <th>問題率</th>
                    </tr>
                  </thead>
                  <tbody>
                    {yearlyStats.map(stats => (
                      <tr key={stats.year} className={stats.year === selectedYear ? 'current-year' : ''}>
                        <td className="year-cell">{stats.year}</td>
                        <td>{stats.total}</td>
                        <td className="healthy">{stats.healthy}</td>
                        <td className="observation">{stats.needsObservation}</td>
                        <td className="pest">{stats.pestDamage}</td>
                        <td className="withering">{stats.withering}</td>
                        <td className="dead">{stats.dead}</td>
                        <td className="problem-rate">
                          {stats.problemRate.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default StatisticsPanel