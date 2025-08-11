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

import { useState, useEffect } from 'react'
import './App.css'

// === CORE COMPONENTS ===
import Map from './components/Map'
import RightSidebar from './components/RightSidebar'
import YearSelector from './components/YearSelector'

// === DATA VISUALIZATION COMPONENTS ===
import TreeMarkers from './components/TreeMarkers'
import JindaiTreeMarkers from './components/JindaiTreeMarkers'
import TimeSeriesTreeMarkers from './components/TimeSeriesTreeMarkers'
import DiseaseCluster from './components/DiseaseCluster'

// === UI COMPONENTS ===
import TreeDetailPanel from './components/TreeDetailPanel'
import JindaiTreeDetailPanel from './components/JindaiTreeDetailPanel'
import TimeSeriesTreeDetailPanel from './components/TimeSeriesTreeDetailPanel'
import DataSourceSelector from './components/DataSourceSelector'

// === STYLES & TYPES & UTILITIES ===
import './components/Map.css'
import { TreeMarkerData, JindaiTreeMarkerData, TimeSeriesTreeMarkerData, DataSource } from './types/tree'
import { loadTreeData } from './utils/csvLoader'
import { clusterTrees, ClusterData } from './utils/clustering'

function App() {
  // ==========================================
  // STATE MANAGEMENT
  // ==========================================

  // === データソース管理 ===
  const [dataSource, setDataSource] = useState<DataSource>('timeseries')

  // === 樹木データ管理 ===
  const [tokyoTrees, setTokyoTrees] = useState<TreeMarkerData[]>([])           // 東京全域の樹木データ
  const [jindaiTrees, setJindaiTrees] = useState<JindaiTreeMarkerData[]>([])   // 神代植物公園のデモデータ
  const [timeSeriesTrees, setTimeSeriesTrees] = useState<TimeSeriesTreeMarkerData[]>([]) // 時系列データ（メイン）
  const [filteredTimeSeriesTrees, setFilteredTimeSeriesTrees] = useState<TimeSeriesTreeMarkerData[]>([]) // 年度フィルター済み
  const [advancedFilteredTrees, setAdvancedFilteredTrees] = useState<TimeSeriesTreeMarkerData[]>([]) // 高度フィルター済み

  // === 時系列制御 ===
  const [availableYears, setAvailableYears] = useState<number[]>([])  // 利用可能な年度リスト
  const [selectedYear, setSelectedYear] = useState<number>(2025)      // 現在選択されている年度

  // === UI状態管理 ===
  const [selectedTokyoTree, setSelectedTokyoTree] = useState<TreeMarkerData | null>(null)
  const [selectedJindaiTree, setSelectedJindaiTree] = useState<JindaiTreeMarkerData | null>(null)
  const [selectedTimeSeriesTree, setSelectedTimeSeriesTree] = useState<TimeSeriesTreeMarkerData | null>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)               // 詳細パネルの開閉状態
  const [flyToLocation, setFlyToLocation] = useState<[number, number] | null>(null) // 地図アニメーション用

  // === アプリケーション状態 ===
  const [loading, setLoading] = useState(true)                        // データ読み込み状態
  const [error, setError] = useState<string | null>(null)             // エラー状態

  // === 可視化制御 ===
  const [showClusters, setShowClusters] = useState(true)              // クラスター表示ON/OFF
  const [showOnlyProblematicTrees, setShowOnlyProblematicTrees] = useState(false) // 問題樹木のみ表示
  const [clusters, setClusters] = useState<ClusterData[]>([])         // 計算済みクラスターデータ
  const [clusterDistance, setClusterDistance] = useState<number>(100) // クラスタリング距離閾値(m)

  // ==========================================
  // CONFIGURATION
  // ==========================================

  /** 地図の初期設定（データソース別） */
  const mapConfigs = {
    tokyo: { center: [35.6762, 139.6503] as [number, number], zoom: 11 },      // 東京全域表示
    jindai: { center: [35.6718, 139.5503] as [number, number], zoom: 16 },     // 神代植物公園拡大表示
    timeseries: { center: [35.6718, 139.5503] as [number, number], zoom: 16 }  // 時系列データ表示
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const treeData = await loadTreeData(dataSource)

        if (dataSource === 'tokyo') {
          setTokyoTrees((treeData as TreeMarkerData[]).slice(0, 1000))
          setJindaiTrees([])
          setTimeSeriesTrees([])
          setFilteredTimeSeriesTrees([])
          setAvailableYears([])
        } else if (dataSource === 'jindai') {
          setJindaiTrees(treeData as JindaiTreeMarkerData[])
          setTokyoTrees([])
          setTimeSeriesTrees([])
          setFilteredTimeSeriesTrees([])
          setAvailableYears([])
        } else if (dataSource === 'timeseries') {
          const timeSeriesData = treeData as TimeSeriesTreeMarkerData[]
          setTimeSeriesTrees(timeSeriesData)
          setTokyoTrees([])
          setJindaiTrees([])

          // Extract available years and sort them
          const years = Array.from(new Set(timeSeriesData.map(tree => tree.year))).sort()
          setAvailableYears(years)

          // Set default year to the latest year
          const latestYear = years.length > 0 ? Math.max(...years) : 2025
          setSelectedYear(latestYear)
        }

        setError(null)
      } catch (err) {
        setError('データの読み込みに失敗しました')
        console.error('Error loading tree data:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [dataSource])

  // Filter time series data by selected year and generate clusters
  useEffect(() => {
    if (dataSource === 'timeseries' && timeSeriesTrees.length > 0) {
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
      const newClusters = clusterTrees(filtered, clusterDistance)
      setClusters(newClusters)
    }
  }, [dataSource, timeSeriesTrees, advancedFilteredTrees, selectedYear, showOnlyProblematicTrees, clusterDistance])

  const handleTokyoMarkerClick = (tree: TreeMarkerData) => {
    setSelectedTokyoTree(tree)
    setSelectedJindaiTree(null)
    setSelectedTimeSeriesTree(null)
    setIsPanelOpen(true)
    setFlyToLocation([tree.latitude, tree.longitude])
  }

  const handleJindaiMarkerClick = (tree: JindaiTreeMarkerData) => {
    setSelectedJindaiTree(tree)
    setSelectedTokyoTree(null)
    setSelectedTimeSeriesTree(null)
    setIsPanelOpen(true)
    setFlyToLocation([tree.latitude, tree.longitude])
  }

  const handleTimeSeriesMarkerClick = (tree: TimeSeriesTreeMarkerData) => {
    setSelectedTimeSeriesTree(tree)
    setSelectedTokyoTree(null)
    setSelectedJindaiTree(null)
    setIsPanelOpen(true)
    setFlyToLocation([tree.latitude, tree.longitude])
  }

  const handlePanelClose = () => {
    setIsPanelOpen(false)
    setSelectedTokyoTree(null)
    setSelectedJindaiTree(null)
    setSelectedTimeSeriesTree(null)
    setFlyToLocation(null)
  }

  const handleMapClick = () => {
    if (isPanelOpen) {
      handlePanelClose()
    }
  }

  const handleDataSourceChange = (source: DataSource) => {
    setDataSource(source)
    setIsPanelOpen(false)
    setSelectedTokyoTree(null)
    setSelectedJindaiTree(null)
    setSelectedTimeSeriesTree(null)
  }

  const handleYearChange = (year: number) => {
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
  }

  const currentConfig = mapConfigs[dataSource]

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-content">
          <h1>ナラ枯れ・マツ枯れ情報マップ</h1>
          <DataSourceSelector
            selectedSource={dataSource}
            onSourceChange={handleDataSourceChange}
            loading={loading}
          />
        </div>
        {loading && <div className="status-message">データ読み込み中...</div>}
        {error && <div className="status-message error">{error}</div>}
      </header>
      <main className="App-main">
        <Map
          className="map-container"
          center={currentConfig.center}
          zoom={currentConfig.zoom}
          key={dataSource} // Force re-render when data source changes
          onMapClick={handleMapClick}
          flyToLocation={flyToLocation}
        >
          {!loading && !error && dataSource === 'tokyo' && (
            <TreeMarkers trees={tokyoTrees} onMarkerClick={handleTokyoMarkerClick} />
          )}
          {!loading && !error && dataSource === 'jindai' && (
            <JindaiTreeMarkers trees={jindaiTrees} onMarkerClick={handleJindaiMarkerClick} />
          )}
          {!loading && !error && dataSource === 'timeseries' && (
            <>
              <TimeSeriesTreeMarkers
                trees={filteredTimeSeriesTrees}
                onMarkerClick={handleTimeSeriesMarkerClick}
                selectedTree={selectedTimeSeriesTree}
              />
              {showClusters && <DiseaseCluster clusters={clusters} year={selectedYear} />}
            </>
          )}
        </Map>
        {dataSource === 'timeseries' && (
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
            filteredTrees={filteredTimeSeriesTrees}
            clusters={clusters}
          />
        )}
      </main>
      {dataSource === 'tokyo' && (
        <TreeDetailPanel
          tree={selectedTokyoTree}
          isOpen={isPanelOpen}
          onClose={handlePanelClose}
        />
      )}
      {dataSource === 'jindai' && (
        <JindaiTreeDetailPanel
          tree={selectedJindaiTree}
          isOpen={isPanelOpen}
          onClose={handlePanelClose}
        />
      )}
      {dataSource === 'timeseries' && (
        <>
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
        </>
      )}
    </div>
  )
}

export default App