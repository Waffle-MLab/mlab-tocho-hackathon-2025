/**
 * ===================================
 * なら枯れ・松枯れ情報マップ アプリケーション
 * ===================================
 * 
 * 【機能概要】
 * - 時系列樹木データの可視化（2015-2025年）
 * - 病気クラスタリング分析と表示
 * - インタラクティブな地図操作
 * - 統計情報とデータエクスポート
 * 
 * 【主要コンポーネント】
 * - Map: Leaflet地図コンテナ
 * - RightSidebar: 統合制御パネル
 * - YearSelector: 年代選択・アニメーション制御
 * - TreeMarkers: 樹木マーカー表示
 * - DiseaseCluster: 病気クラスター可視化
 */

import { useState, useEffect, useMemo, useCallback } from 'react'
import '../App.css'

// === CORE COMPONENTS ===
import Map from '../components/Map'
import RightSidebar from '../components/RightSidebar'
import YearSelector from '../components/YearSelector'

// === DATA VISUALIZATION COMPONENTS ===
import TimeSeriesTreeMarkers from '../components/TimeSeriesTreeMarkers'
import SVGClusterOverlay from '../components/SVGClusterOverlay'

// === UI COMPONENTS ===
import TimeSeriesTreeDetailPanel from '../components/TimeSeriesTreeDetailPanel'

// === STYLES & TYPES & UTILITIES ===
import '../components/Map.css'
import { TimeSeriesTreeMarkerData } from '../types/tree'
import { loadTreeData } from '../utils/csvLoader'
import { clusterTrees, ClusterData } from '../utils/clustering'
import L from 'leaflet'

function ViewPage() {
  // ==========================================
  // STATE MANAGEMENT
  // ==========================================

  // === 樹木データ管理 ===
  const [timeSeriesTrees, setTimeSeriesTrees] = useState<TimeSeriesTreeMarkerData[]>([]) // 時系列データ（メイン）
  const [filteredTimeSeriesTrees, setFilteredTimeSeriesTrees] = useState<TimeSeriesTreeMarkerData[]>([]) // 年度フィルター済み
  const [advancedFilteredTrees, setAdvancedFilteredTrees] = useState<TimeSeriesTreeMarkerData[]>([]) // 高度フィルター済み

  // === 時系列制御 ===
  const [availableYears, setAvailableYears] = useState<number[]>([])  // 利用可能な年度リスト
  const [selectedYear, setSelectedYear] = useState<number>(2025)      // 現在選択されている年度

  // === UI状態管理 ===
  const [selectedTimeSeriesTree, setSelectedTimeSeriesTree] = useState<TimeSeriesTreeMarkerData | null>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)               // 詳細パネルの開閉状態
  const [flyToLocation, setFlyToLocation] = useState<[number, number] | null>(null) // 地図アニメーション用
  const [mapBounds, setMapBounds] = useState<L.LatLngBounds | null>(null) // 地図の表示範囲

  // === アプリケーション状態 ===
  const [loading, setLoading] = useState(true)                        // データ読み込み状態
  const [error, setError] = useState<string | null>(null)             // エラー状態

  // === 可視化制御 ===
  const [showClusters, setShowClusters] = useState(true)              // クラスター表示ON/OFF
  const [showOnlyProblematicTrees, setShowOnlyProblematicTrees] = useState(false) // 問題樹木のみ表示
  const [clusters, setClusters] = useState<ClusterData[]>([])         // 計算済みクラスターデータ
  const [clusterDistance, setClusterDistance] = useState<number>(25) // クラスタリング円の半径(m)
  const [overlapThreshold, setOverlapThreshold] = useState<number>(0.3) // 円の結合閾値（30%重なりで結合）

  // ==========================================
  // CONFIGURATION
  // ==========================================

  /** 地図の初期設定 */
  const mapConfig = { center: [35.6718, 139.5503] as [number, number], zoom: 16 }

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const timeSeriesData = await loadTreeData()
        setTimeSeriesTrees(timeSeriesData)

        // Extract available years and sort them
        const years = Array.from(new Set(timeSeriesData.map(tree => tree.year))).sort()
        setAvailableYears(years)

        // Set default year to the latest year
        const latestYear = years.length > 0 ? Math.max(...years) : 2025
        setSelectedYear(latestYear)

        setError(null)
      } catch (err) {
        setError('データの読み込みに失敗しました')
        console.error('Error loading tree data:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Filter time series data by selected year and generate clusters
  useEffect(() => {
    if (timeSeriesTrees.length > 0) {
      // Use advanced filtered trees if available, otherwise use all trees
      const treesToFilter = advancedFilteredTrees.length > 0 ? advancedFilteredTrees : timeSeriesTrees
      let filtered = treesToFilter.filter(tree => tree.year === selectedYear)

      // Apply problematic trees filter if enabled
      if (showOnlyProblematicTrees) {
        filtered = filtered.filter(tree =>
          tree.condition === '枯死' ||
          tree.condition === '立ち枯れ' ||
          tree.condition === '虫害'
        )
      }

      setFilteredTimeSeriesTrees(filtered)

      // Generate clusters for the filtered data
      const newClusters = clusterTrees(filtered, clusterDistance, overlapThreshold)
      setClusters(newClusters)
    }
  }, [timeSeriesTrees, advancedFilteredTrees, selectedYear, showOnlyProblematicTrees, clusterDistance, overlapThreshold])

  const handleTimeSeriesMarkerClick = useCallback((tree: TimeSeriesTreeMarkerData) => {
    setSelectedTimeSeriesTree(tree)
    setIsPanelOpen(true)
    setFlyToLocation([tree.latitude, tree.longitude])
  }, [])

  const handlePanelClose = useCallback(() => {
    setIsPanelOpen(false)
    setSelectedTimeSeriesTree(null)
    setFlyToLocation(null)
  }, [])

  const handleMapClick = useCallback(() => {
    if (isPanelOpen) {
      handlePanelClose()
    }
    setFlyToLocation(null)
  }, [isPanelOpen, handlePanelClose])


  const handleYearChange = useCallback((year: number) => {
    setSelectedYear(year)

    // If a tree is currently selected, try to find the same tree in the new year
    if (selectedTimeSeriesTree && isPanelOpen) {
      // Find the same tree in the new year data
      const sameTreeInNewYear = timeSeriesTrees.find(tree =>
        tree.treeId === selectedTimeSeriesTree.treeId && tree.year === year
      )

      if (sameTreeInNewYear) {
        // Update the selected tree with the new year's data
        setSelectedTimeSeriesTree(sameTreeInNewYear)
        // Keep the panel open
      } else {
        // Tree doesn't exist in this year, close the panel
        setIsPanelOpen(false)
        setSelectedTimeSeriesTree(null)
      }
    }
  }, [selectedTimeSeriesTree, isPanelOpen, timeSeriesTrees])


  // ビューポート変更ハンドラー
  const handleViewportChange = useCallback((bounds: L.LatLngBounds) => {
    setMapBounds(bounds)
  }, [])

  // ビューポート内のデータをフィルタリング
  const getTreesInViewport = useMemo(() => {
    return (trees: TimeSeriesTreeMarkerData[]) => {
      if (!mapBounds) return trees
      return trees.filter(tree => 
        mapBounds.contains([tree.latitude, tree.longitude])
      )
    }
  }, [mapBounds])

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-content">
          <h1>ナラ枯れ・マツ枯れ情報マップ</h1>
        </div>
        {loading && <div className="status-message">データ読み込み中...</div>}
        {error && <div className="status-message error">{error}</div>}
      </header>
      <main className="App-main">
        <Map
          className="map-container"
          center={mapConfig.center}
          zoom={mapConfig.zoom}
          onMapClick={handleMapClick}
          flyToLocation={flyToLocation}
          onViewportChange={handleViewportChange}
        >
          {!loading && !error && (
            <>
              <TimeSeriesTreeMarkers
                trees={filteredTimeSeriesTrees}
                onMarkerClick={handleTimeSeriesMarkerClick}
                selectedTree={selectedTimeSeriesTree}
              />
              {showClusters && <SVGClusterOverlay clusters={clusters} year={selectedYear} overlapThreshold={overlapThreshold} />}
            </>
          )}
        </Map>
        <RightSidebar
          trees={advancedFilteredTrees.length > 0 ? advancedFilteredTrees : timeSeriesTrees}
          availableYears={availableYears}
          selectedYear={selectedYear}
          onFilterChange={setAdvancedFilteredTrees}
          showClusters={showClusters}
          onToggleClusters={setShowClusters}
          showOnlyProblematicTrees={showOnlyProblematicTrees}
          onToggleProblematicFilter={setShowOnlyProblematicTrees}
          clusterDistance={clusterDistance}
          onDistanceChange={setClusterDistance}
          overlapThreshold={overlapThreshold}
          onOverlapThresholdChange={setOverlapThreshold}
          filteredTrees={useMemo(() => getTreesInViewport(filteredTimeSeriesTrees), [getTreesInViewport, filteredTimeSeriesTrees])}
          clusters={clusters}
          mapBounds={mapBounds}
          allTreesInViewport={useMemo(() => getTreesInViewport(advancedFilteredTrees.length > 0 ? advancedFilteredTrees : timeSeriesTrees), [getTreesInViewport, advancedFilteredTrees, timeSeriesTrees])}
        />
      </main>
      <TimeSeriesTreeDetailPanel
        tree={selectedTimeSeriesTree}
        isOpen={isPanelOpen}
        onClose={handlePanelClose}
      />
      <YearSelector
        years={availableYears}
        selectedYear={selectedYear}
        onYearChange={handleYearChange}
        loading={loading}
      />
    </div>
  )
}

export default ViewPage