import { useState } from 'react'
import html2canvas from 'html2canvas'
import { TimeSeriesTreeMarkerData } from '../types/tree'
import { ClusterData } from '../utils/clustering'
import './ExportControls.css'

interface ExportControlsProps {
  trees: TimeSeriesTreeMarkerData[]
  clusters: ClusterData[]
  selectedYear: number
}

const ExportControls = ({ trees, clusters, selectedYear }: ExportControlsProps) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const exportMapAsImage = async () => {
    setIsExporting(true)
    try {
      // Find the map container
      const mapContainer = document.querySelector('.leaflet-container') as HTMLElement
      if (!mapContainer) {
        throw new Error('Map container not found')
      }

      // Temporarily hide UI elements for clean export
      const uiElements = document.querySelectorAll('.year-selector, .statistics-panel, .distance-control, .heatmap-controls, .advanced-filter, .map-controls')
      uiElements.forEach(el => {
        (el as HTMLElement).style.display = 'none'
      })

      // Capture the map
      const canvas = await html2canvas(mapContainer, {
        useCORS: true,
        allowTaint: true
      })

      // Restore UI elements
      uiElements.forEach(el => {
        (el as HTMLElement).style.display = ''
      })

      // Create download link
      const link = document.createElement('a')
      link.download = `tree-disease-map-${selectedYear}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (error) {
      console.error('Failed to export map:', error)
      alert('マップの書き出しに失敗しました。再度お試しください。')
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

  const exportClusterDataAsJSON = () => {
    if (clusters.length === 0) return

    const clusterData = {
      exportDate: new Date().toISOString(),
      year: selectedYear,
      totalClusters: clusters.length,
      clusters: clusters.map(cluster => ({
        id: cluster.id,
        treeCount: cluster.trees.length,
        center: cluster.center,
        bounds: cluster.bounds,
        conditions: cluster.trees.reduce((acc, tree) => {
          acc[tree.condition] = (acc[tree.condition] || 0) + 1
          return acc
        }, {} as Record<string, number>),
        trees: cluster.trees.map(tree => ({
          treeId: tree.treeId,
          species: tree.species,
          condition: tree.condition,
          location: tree.location,
          coordinates: [tree.latitude, tree.longitude]
        }))
      }))
    }

    const blob = new Blob([JSON.stringify(clusterData, null, 2)], { type: 'application/json' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `cluster-data-${selectedYear}.json`
    link.click()
    URL.revokeObjectURL(link.href)
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
              onClick={exportMapAsImage}
              disabled={isExporting}
            >
              {isExporting ? '処理中...' : 'マップを画像で保存'}
            </button>
            <p className="export-note">現在表示中のマップをPNG形式で保存します</p>
          </div>

          <div className="export-section">
            <h4>データ出力</h4>
            <button 
              className="export-button data"
              onClick={exportDataAsCSV}
              disabled={trees.length === 0}
            >
              樹木データ (CSV)
            </button>
            <button 
              className="export-button cluster"
              onClick={exportClusterDataAsJSON}
              disabled={clusters.length === 0}
            >
              クラスターデータ (JSON)
            </button>
            <p className="export-note">フィルター適用後のデータを出力します</p>
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