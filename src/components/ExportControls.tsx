import { useState } from 'react'
import html2canvas from 'html2canvas'
import L from 'leaflet'
import { TimeSeriesTreeMarkerData } from '../types/tree'
import { ClusterData } from '../utils/clustering'
import './ExportControls.css'

interface ExportControlsProps {
  trees: TimeSeriesTreeMarkerData[]
  clusters: ClusterData[]
  selectedYear: number
  viewportTrees?: TimeSeriesTreeMarkerData[]
  mapBounds?: L.LatLngBounds | null
}

const ExportControls = ({ trees, clusters, selectedYear, viewportTrees, mapBounds }: ExportControlsProps) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const exportViewportAsImage = async () => {
    setIsExporting(true)
    try {
      // Find the map container
      const mapContainer = document.querySelector('.leaflet-container') as HTMLElement
      if (!mapContainer) {
        throw new Error('Map container not found')
      }

      // Hide all UI overlays for clean viewport capture
      const uiElements = document.querySelectorAll(
        '.right-sidebar, .tree-detail-panel, .year-selector, .distance-control, .zoom-controls, .leaflet-control-container'
      )
      uiElements.forEach(el => {
        (el as HTMLElement).style.display = 'none'
      })

      // Apply gray filter to map tiles for export (same as web view)
      const tilePane = document.querySelector('.leaflet-tile-pane') as HTMLElement
      let originalFilter = ''
      if (tilePane) {
        originalFilter = tilePane.style.filter
        tilePane.style.filter = 'saturate(0.2) contrast(0.9) brightness(1.1) grayscale(0.2)'
      }

      // Add viewport info overlay
      const infoOverlay = document.createElement('div')
      infoOverlay.style.cssText = `
        position: absolute;
        bottom: 10px;
        left: 10px;
        background: rgba(255,255,255,0.9);
        padding: 8px 12px;
        border-radius: 4px;
        font-size: 12px;
        font-family: sans-serif;
        z-index: 1000;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      `
      
      const boundsInfo = mapBounds ? 
        `表示範囲: ${mapBounds.getNorth().toFixed(5)}, ${mapBounds.getWest().toFixed(5)} - ${mapBounds.getSouth().toFixed(5)}, ${mapBounds.getEast().toFixed(5)}` :
        '表示範囲情報なし'
      
      infoOverlay.innerHTML = `
        <div><strong>ナラ枯れ・マツ枯れ情報マップ ${selectedYear}年</strong></div>
        <div>${boundsInfo}</div>
        <div>樹木数: ${viewportTrees?.length || 0}本 | 出力日時: ${new Date().toLocaleString('ja-JP')}</div>
        <div style="margin-top: 4px; font-size: 10px; color: #666;">© OpenStreetMap contributors (https://www.openstreetmap.org/copyright)<br>ODbL (https://opendatacommons.org/licenses/odbl/) | CC-BY-SA (https://creativecommons.org/licenses/by-sa/2.0/)</div>
      `
      mapContainer.appendChild(infoOverlay)

      // Capture the viewport
      const canvas = await html2canvas(mapContainer, {
        useCORS: true,
        allowTaint: true,
        background: '#ffffff'
      })

      // Remove info overlay and restore UI elements
      mapContainer.removeChild(infoOverlay)
      uiElements.forEach(el => {
        (el as HTMLElement).style.display = ''
      })

      // Restore original map filter
      if (tilePane) {
        tilePane.style.filter = originalFilter
      }

      // Create download link
      const link = document.createElement('a')
      link.download = `tree-map-viewport-${selectedYear}-${new Date().toISOString().split('T')[0]}.png`
      link.href = canvas.toDataURL('image/png', 0.9)
      link.click()
    } catch (error) {
      console.error('Failed to export viewport:', error)
      alert('ビューポートの書き出しに失敗しました。再度お試しください。')
    } finally {
      setIsExporting(false)
    }
  }

  const exportDataAsCSV = () => {
    if (trees.length === 0) return

    // Create CSV headers
    const headers = [
      '年度',
      '番号',
      '樹木ID',
      '樹種',
      '立地',
      '幹周(cm)',
      '樹高(m)',
      '状態',
      '備考',
      '緯度',
      '経度'
    ]

    // Create CSV rows
    const rows = trees.map(tree => [
      tree.year,
      tree.number,
      tree.treeId,
      tree.species,
      tree.location,
      tree.circumference,
      tree.height,
      tree.condition,
      tree.notes,
      tree.latitude,
      tree.longitude
    ])

    // Combine headers and rows
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')

    // Create and download file
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' }) // BOM for Excel
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `tree-data-${selectedYear}.csv`
    link.click()
    URL.revokeObjectURL(link.href)
  }

  const exportAsGeoJSON = () => {
    const treesToExport = viewportTrees && viewportTrees.length > 0 ? viewportTrees : trees
    if (treesToExport.length === 0) return

    // GeoJSON Feature Collection for trees
    const treeFeatures = treesToExport.map(tree => ({
      type: "Feature",
      properties: {
        treeId: tree.treeId,
        number: tree.number,
        year: tree.year,
        species: tree.species,
        location: tree.location,
        circumference: tree.circumference,
        height: tree.height,
        condition: tree.condition,
        notes: tree.notes
      },
      geometry: {
        type: "Point",
        coordinates: [tree.longitude, tree.latitude] // GeoJSONは [lng, lat] 順
      }
    }))

    // GeoJSON Feature Collection for clusters
    const clusterFeatures = clusters.map(cluster => {
      // クラスターの円形範囲をポリゴンとして表現
      const circleToPolygon = (center: [number, number], radiusInMeters: number) => {
        const points = []
        const steps = 32
        const radiusInDegrees = radiusInMeters / 111320 // 度に変換（簡易）
        
        for (let i = 0; i <= steps; i++) {
          const angle = (i * 2 * Math.PI) / steps
          const lat = center[0] + radiusInDegrees * Math.cos(angle)
          const lng = center[1] + radiusInDegrees * Math.sin(angle) / Math.cos(center[0] * Math.PI / 180)
          points.push([lng, lat]) // GeoJSON形式 [lng, lat]
        }
        return [points] // Polygon requires array of rings
      }

      // 最初の円を基準にポリゴンを作成（簡易版）
      const firstCircle = cluster.circles[0]
      const coordinates = firstCircle ? 
        circleToPolygon(firstCircle.center, firstCircle.radius) :
        [[[cluster.center[1], cluster.center[0]], [cluster.center[1], cluster.center[0]], [cluster.center[1], cluster.center[0]], [cluster.center[1], cluster.center[0]]]]

      return {
        type: "Feature",
        properties: {
          clusterId: cluster.id,
          treeCount: cluster.trees.length,
          year: selectedYear,
          centerLat: cluster.center[0],
          centerLng: cluster.center[1],
          conditions: cluster.trees.reduce((acc, tree) => {
            acc[tree.condition] = (acc[tree.condition] || 0) + 1
            return acc
          }, {} as Record<string, number>)
        },
        geometry: {
          type: "Polygon",
          coordinates: coordinates
        }
      }
    })

    const geoJsonData = {
      type: "FeatureCollection",
      name: `tree_disease_data_${selectedYear}`,
      crs: {
        type: "name",
        properties: {
          name: "urn:ogc:def:crs:OGC:1.3:CRS84"
        }
      },
      features: [...treeFeatures, ...clusterFeatures],
      metadata: {
        exportDate: new Date().toISOString(),
        year: selectedYear,
        totalTrees: treesToExport.length,
        totalClusters: clusters.length,
        bounds: mapBounds ? {
          north: mapBounds.getNorth(),
          south: mapBounds.getSouth(),
          east: mapBounds.getEast(),
          west: mapBounds.getWest()
        } : null,
        description: "Tree disease monitoring data with clusters",
        source: "ナラ枯れ・マツ枯れ情報マップ"
      }
    }

    const blob = new Blob([JSON.stringify(geoJsonData, null, 2)], { type: 'application/geo+json' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `tree-disease-data-${selectedYear}.geojson`
    link.click()
    URL.revokeObjectURL(link.href)
  }

  const exportAsShapefile = () => {
    // Shapefileは複雑なバイナリ形式なので、CSVに緯度経度を含めてQGISで読み込み可能な形式で出力
    const treesToExport = viewportTrees && viewportTrees.length > 0 ? viewportTrees : trees
    if (treesToExport.length === 0) return

    // Points CSV for trees (Shapefile compatible)
    const pointsHeaders = [
      'tree_id', 'number', 'year', 'species', 'location', 'circumference', 'height', 
      'condition', 'notes', 'longitude', 'latitude'
    ]

    const pointsRows = treesToExport.map(tree => [
      tree.treeId,
      tree.number,
      tree.year,
      tree.species,
      tree.location,
      tree.circumference,
      tree.height,
      tree.condition,
      tree.notes || '',
      tree.longitude,
      tree.latitude
    ])

    const pointsCsv = [pointsHeaders, ...pointsRows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')

    // Polygons CSV for clusters
    const clustersHeaders = [
      'cluster_id', 'tree_count', 'year', 'center_lat', 'center_lng', 'conditions', 'wkt_geometry'
    ]

    const clustersRows = clusters.map(cluster => {
      const firstCircle = cluster.circles[0]
      let wktGeometry = 'POINT EMPTY'
      
      if (firstCircle) {
        // WKT POLYGON for the cluster area
        const points = []
        const steps = 16
        const radiusInDegrees = firstCircle.radius / 111320
        
        for (let i = 0; i <= steps; i++) {
          const angle = (i * 2 * Math.PI) / steps
          const lat = firstCircle.center[0] + radiusInDegrees * Math.cos(angle)
          const lng = firstCircle.center[1] + radiusInDegrees * Math.sin(angle) / Math.cos(firstCircle.center[0] * Math.PI / 180)
          points.push(`${lng} ${lat}`)
        }
        wktGeometry = `POLYGON((${points.join(',')}))`
      }

      const conditionsStr = Object.entries(
        cluster.trees.reduce((acc, tree) => {
          acc[tree.condition] = (acc[tree.condition] || 0) + 1
          return acc
        }, {} as Record<string, number>)
      ).map(([k, v]) => `${k}:${v}`).join(';')

      return [
        cluster.id,
        cluster.trees.length,
        selectedYear,
        cluster.center[0],
        cluster.center[1],
        conditionsStr,
        wktGeometry
      ]
    })

    const clustersCsv = [clustersHeaders, ...clustersRows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')

    // Create a ZIP-like structure information file
    const readmeContent = `
QGIS読み込み手順:
================

1. points.csv (樹木データ):
   - QGISで「区切りテキストレイヤを追加」
   - X座標: longitude, Y座標: latitude
   - CRS: EPSG:4326 (WGS84)

2. clusters.csv (クラスターデータ):
   - QGISで「区切りテキストレイヤを追加」  
   - ジオメトリ定義: Well Known Text (WKT)
   - ジオメトリフィールド: wkt_geometry
   - CRS: EPSG:4326 (WGS84)

データ説明:
===========
- tree_id: 樹木固有ID
- condition: 樹木の状態 (健全/枯死/立ち枯れ/虫害/要観察/枝折れ)
- cluster_id: クラスター固有ID
- tree_count: クラスター内樹木数
- conditions: 状態別内訳 (例: 枯死:3;虫害:2)

出力日時: ${new Date().toLocaleString('ja-JP')}
データ年度: ${selectedYear}年
樹木数: ${treesToExport.length}本
クラスター数: ${clusters.length}個
`

    // Download points CSV
    const pointsBlob = new Blob(['\ufeff' + pointsCsv], { type: 'text/csv;charset=utf-8' })
    const pointsLink = document.createElement('a')
    pointsLink.href = URL.createObjectURL(pointsBlob)
    pointsLink.download = `tree-points-${selectedYear}.csv`
    pointsLink.click()
    URL.revokeObjectURL(pointsLink.href)

    // Download clusters CSV
    const clustersBlob = new Blob(['\ufeff' + clustersCsv], { type: 'text/csv;charset=utf-8' })
    const clustersLink = document.createElement('a')
    clustersLink.href = URL.createObjectURL(clustersBlob)
    clustersLink.download = `tree-clusters-${selectedYear}.csv`
    clustersLink.click()
    URL.revokeObjectURL(clustersLink.href)

    // Download README
    const readmeBlob = new Blob([readmeContent], { type: 'text/plain;charset=utf-8' })
    const readmeLink = document.createElement('a')
    readmeLink.href = URL.createObjectURL(readmeBlob)
    readmeLink.download = `QGIS-import-guide-${selectedYear}.txt`
    readmeLink.click()
    URL.revokeObjectURL(readmeLink.href)

    alert('3つのファイルをダウンロードしました:\n1. tree-points-*.csv (樹木データ)\n2. tree-clusters-*.csv (クラスターデータ)\n3. QGIS-import-guide-*.txt (読み込み手順)')
  }

  const generateReport = () => {
    const totalTrees = trees.length
    const healthyTrees = trees.filter(tree => tree.condition === '健全').length
    const problematicTrees = trees.filter(tree => 
      tree.condition === '枯死' || tree.condition === '立ち枯れ' || tree.condition === '虫害'
    ).length

    const conditionCounts = trees.reduce((acc, tree) => {
      acc[tree.condition] = (acc[tree.condition] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const speciesCounts = trees.reduce((acc, tree) => {
      acc[tree.species] = (acc[tree.species] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const reportData = {
      reportDate: new Date().toLocaleString('ja-JP'),
      year: selectedYear,
      summary: {
        totalTrees,
        healthyTrees,
        problematicTrees,
        healthyRate: totalTrees > 0 ? ((healthyTrees / totalTrees) * 100).toFixed(1) + '%' : '0%',
        problematicRate: totalTrees > 0 ? ((problematicTrees / totalTrees) * 100).toFixed(1) + '%' : '0%'
      },
      conditionBreakdown: conditionCounts,
      speciesBreakdown: speciesCounts,
      clusters: {
        totalClusters: clusters.length,
        affectedTrees: clusters.reduce((sum, cluster) => sum + cluster.trees.length, 0),
        clusterDetails: clusters.map(cluster => ({
          id: cluster.id,
          treeCount: cluster.trees.length,
          location: `${cluster.center[0].toFixed(6)}, ${cluster.center[1].toFixed(6)}`
        }))
      }
    }

    const reportText = `
神代植物公園 樹木健康状態レポート - ${selectedYear}年
============================================

生成日時: ${reportData.reportDate}

## 概要
- 総樹木数: ${reportData.summary.totalTrees}本
- 健全な樹木: ${reportData.summary.healthyTrees}本 (${reportData.summary.healthyRate})
- 問題のある樹木: ${reportData.summary.problematicTrees}本 (${reportData.summary.problematicRate})

## 状態別内訳
${Object.entries(reportData.conditionBreakdown)
  .map(([condition, count]) => `- ${condition}: ${count}本`)
  .join('\n')}

## 樹種別内訳
${Object.entries(reportData.speciesBreakdown)
  .sort(([,a], [,b]) => b - a)
  .slice(0, 10)
  .map(([species, count]) => `- ${species}: ${count}本`)
  .join('\n')}

## クラスター分析
- 検出されたクラスター数: ${reportData.clusters.totalClusters}
- 影響を受けた樹木数: ${reportData.clusters.affectedTrees}本

${reportData.clusters.clusterDetails
  .map(cluster => `- クラスター${cluster.id}: ${cluster.treeCount}本 (${cluster.location})`)
  .join('\n')}
`

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `tree-report-${selectedYear}.txt`
    link.click()
    URL.revokeObjectURL(link.href)
  }

  return (
    <div className={`export-controls ${isExpanded ? 'expanded' : ''}`}>
      <div className="control-header" onClick={() => setIsExpanded(!isExpanded)}>
        <span className="control-title">エクスポート</span>
        <span className="control-toggle">{isExpanded ? '−' : '+'}</span>
      </div>

      {isExpanded && (
        <div className="control-content">
          <div className="export-section">
            <h4>画像出力</h4>
            <button 
              className="export-button image"
              onClick={exportViewportAsImage}
              disabled={isExporting}
            >
              {isExporting ? '処理中...' : '現在の表示範囲を画像で保存'}
            </button>
            <p className="export-note">表示中のビューポートをPNG形式で保存（座標情報付き）</p>
          </div>

          <div className="export-section">
            <h4>GIS対応データ出力</h4>
            <button 
              className="export-button geojson"
              onClick={exportAsGeoJSON}
              disabled={trees.length === 0}
            >
              GeoJSON形式
            </button>
            <button 
              className="export-button shapefile"
              onClick={exportAsShapefile}
              disabled={trees.length === 0}
            >
              QGIS対応CSV
            </button>
            <p className="export-note">QGISやArcGISで読み込み可能な地理データ形式</p>
          </div>

          <div className="export-section">
            <h4>従来データ出力</h4>
            <button 
              className="export-button data"
              onClick={exportDataAsCSV}
              disabled={trees.length === 0}
            >
              樹木データ (CSV)
            </button>
            <p className="export-note">表計算ソフト用の汎用CSV形式</p>
          </div>

          <div className="export-section">
            <h4>レポート生成</h4>
            <button 
              className="export-button report"
              onClick={generateReport}
              disabled={trees.length === 0}
            >
統計レポート (TXT)
            </button>
            <p className="export-note">現在の統計情報を要約したレポートを生成します</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default ExportControls