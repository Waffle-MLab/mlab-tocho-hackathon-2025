import { useState } from 'react'
import { TimeSeriesTreeMarkerData } from '../types/tree'
import { ClusterData } from '../utils/clustering'
import StatisticsPanel from './StatisticsPanel'
import AdvancedFilter from './AdvancedFilter'
import DistanceControl from './DistanceControl'
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
  
  // Export
  filteredTrees: TimeSeriesTreeMarkerData[]
  clusters: ClusterData[]
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
  filteredTrees,
  clusters
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
            />
          </div>
          
          <div className="sidebar-section">
            <AdvancedFilter 
              trees={trees}
              availableYears={availableYears}
              onFilterChange={onFilterChange}
              showClusters={showClusters}
              onToggleClusters={onToggleClusters}
              showOnlyProblematicTrees={showOnlyProblematicTrees}
              onToggleProblematicFilter={onToggleProblematicFilter}
            />
          </div>
          
          <div className="sidebar-section">
            <DistanceControl 
              distance={clusterDistance}
              onDistanceChange={onDistanceChange}
            />
          </div>
          
          <div className="sidebar-section">
            <ExportControls 
              trees={filteredTrees}
              clusters={clusters}
              selectedYear={selectedYear}
            />
          </div>
        </div>
      )}
    </div>
    </>
  )
}

export default RightSidebar