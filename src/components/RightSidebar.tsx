import { useState } from 'react'
import L from 'leaflet'
import { TimeSeriesTreeMarkerData } from '../types/tree'
import { ClusterData } from '../utils/clustering'
import StatisticsPanel from './StatisticsPanel'
import AdvancedFilter from './AdvancedFilter'
import ExportControls from './ExportControls'
import ZoomControls from './ZoomControls'
import './RightSidebar.css'

interface RightSidebarProps {
  // Statistics
  trees: TimeSeriesTreeMarkerData[]
  availableYears: number[]
  selectedYear: number
  
  // Filter
  onFilterChange: (filteredTrees: TimeSeriesTreeMarkerData[]) => void
  showClusters: boolean
  onToggleClusters: (show: boolean) => void
  showOnlyProblematicTrees: boolean
  onToggleProblematicFilter: (show: boolean) => void
  
  // Clustering
  clusterDistance: number
  onDistanceChange: (distance: number) => void
  overlapThreshold?: number
  onOverlapThresholdChange?: (threshold: number) => void
  
  // Export
  filteredTrees: TimeSeriesTreeMarkerData[]
  clusters: ClusterData[]
  mapBounds?: L.LatLngBounds | null
  
  // Viewport filtering for statistics
  allTreesInViewport?: TimeSeriesTreeMarkerData[]
}

const RightSidebar = ({
  trees,
  availableYears,
  selectedYear,
  onFilterChange,
  showClusters,
  onToggleClusters,
  showOnlyProblematicTrees,
  onToggleProblematicFilter,
  clusterDistance,
  onDistanceChange,
  overlapThreshold,
  onOverlapThresholdChange,
  filteredTrees,
  clusters,
  mapBounds,
  allTreesInViewport
}: RightSidebarProps) => {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <>
      <ZoomControls isExpanded={isExpanded} />
      <div className={`right-sidebar ${isExpanded ? 'expanded' : ''}`}>
        <div className="sidebar-header" onClick={() => setIsExpanded(!isExpanded)}>
          <span className="sidebar-title">コントロールパネル</span>
          <span className="sidebar-toggle">{isExpanded ? '×' : '☰'}</span>
        </div>
      
      {isExpanded && (
        <div className="sidebar-content">
          <div className="sidebar-section">
            <StatisticsPanel 
              trees={trees}
              availableYears={availableYears}
              selectedYear={selectedYear}
              allTreesInViewport={allTreesInViewport}
            />
          </div>
          
          <div className="sidebar-section">
            <AdvancedFilter 
              trees={trees}
              onFilterChange={onFilterChange}
              showClusters={showClusters}
              onToggleClusters={onToggleClusters}
              showOnlyProblematicTrees={showOnlyProblematicTrees}
              onToggleProblematicFilter={onToggleProblematicFilter}
              clusterDistance={clusterDistance}
              onDistanceChange={onDistanceChange}
              overlapThreshold={overlapThreshold}
              onOverlapThresholdChange={onOverlapThresholdChange}
            />
          </div>
          
          
          <div className="sidebar-section">
            <ExportControls 
              trees={filteredTrees}
              clusters={clusters}
              selectedYear={selectedYear}
              viewportTrees={allTreesInViewport}
              mapBounds={mapBounds}
            />
          </div>
        </div>
      )}
    </div>
    </>
  )
}

export default RightSidebar