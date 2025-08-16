import { Marker } from 'react-leaflet'
import { TimeSeriesTreeMarkerData } from '../types/tree'
import L from 'leaflet'

interface TimeSeriesTreeMarkersProps {
  trees: TimeSeriesTreeMarkerData[]
  onMarkerClick: (tree: TimeSeriesTreeMarkerData) => void
  selectedTree?: TimeSeriesTreeMarkerData | null
}

// QGIS-style colored circle icon for time series data
const createTimeSeriesTreeIcon = (condition: string, year: number, isSelected: boolean = false) => {
  const getColor = (condition: string) => {
    const colors = {
      '健全': '#22c55e',        // --color-healthy
      '要観察': '#f59e0b',      // --color-observation
      '虫害': '#ef4444',        // --color-pest
      '立ち枯れ': '#6b7280',    // --color-withering
      '枯死': '#4b5563',        // --color-dead
      '枝折れ': '#f97316',      // --color-branch-broken
    } as const
    
    return colors[condition as keyof typeof colors] || '#3b82f6' // --color-default
  }

  const color = getColor(condition)
  
  // Add a subtle year indicator by adjusting opacity based on how recent the year is
  const opacity = Math.max(0.7, 1 - (2025 - year) * 0.05)
  
  const size = isSelected ? 16 : 12
  const strokeWidth = isSelected ? 3 : 2
  const glowEffect = isSelected ? `filter: drop-shadow(0 0 8px ${color}) drop-shadow(0 0 16px ${color});` : ''
  
  return new L.DivIcon({
    html: `<div style="
      width: ${size}px; 
      height: ${size}px; 
      background-color: ${color};
      border: ${strokeWidth}px solid white;
      border-radius: 50%; 
      box-shadow: 0 1px 3px rgba(0,0,0,0.4);
      opacity: ${opacity};
      transition: all 0.3s ease;
      transform: ${isSelected ? 'scale(1.3)' : 'scale(1)'};
      pointer-events: none;
      user-select: none;
      -webkit-user-drag: none;
      ${glowEffect}
    "></div>`,
    className: `custom-tree-marker${isSelected ? ' selected' : ''}`,
    iconSize: [size + strokeWidth * 2, size + strokeWidth * 2],
    iconAnchor: [(size + strokeWidth * 2)/2, (size + strokeWidth * 2)/2],
  })
}

const TimeSeriesTreeMarkers = ({ trees, onMarkerClick, selectedTree }: TimeSeriesTreeMarkersProps) => {
  return (
    <>
      {trees.map((tree) => {
        const isSelected = selectedTree?.id === tree.id
        return (
          <Marker
            key={tree.id}
            position={[tree.latitude, tree.longitude]}
            icon={createTimeSeriesTreeIcon(tree.condition, tree.year, isSelected)}
            draggable={false}
            keyboard={false}
            bubblingMouseEvents={false}
            eventHandlers={{
              click: (e) => {
                e.originalEvent?.stopPropagation()
                e.originalEvent?.preventDefault()
                onMarkerClick(tree)
              },
            }}
            zIndexOffset={isSelected ? 1000 : 0}
          />
        )
      })}
    </>
  )
}

export default TimeSeriesTreeMarkers