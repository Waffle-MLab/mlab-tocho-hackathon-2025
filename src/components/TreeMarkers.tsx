import { Marker } from 'react-leaflet'
import { TreeMarkerData } from '../types/tree'
import L from 'leaflet'

interface TreeMarkersProps {
  trees: TreeMarkerData[]
  onMarkerClick: (tree: TreeMarkerData) => void
}

// Custom beautiful tree icon with SVG for Tokyo data
const createTokyoTreeIcon = (health: string) => {
  const getColor = (health: string) => {
    if (health.includes('良好') || health.includes('健全')) {
      return '#22c55e' // Green
    } else if (health.includes('普通') || health.includes('中程度')) {
      return '#f59e0b' // Orange
    } else if (health.includes('不良') || health.includes('枯死')) {
      return '#ef4444' // Red
    } else {
      return '#10b981' // Default green
    }
  }

  const color = getColor(health)
  
  const svgIcon = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" fill="${color}" stroke="white" stroke-width="2"/>
      <path d="M12 3C10.5 3 9.5 4 9.5 5.5C9.5 7 10.5 8 12 8C13.5 8 14.5 7 14.5 5.5C14.5 4 13.5 3 12 3Z" fill="white"/>
      <path d="M8 7C6.5 7 5.5 8 5.5 9.5C5.5 11 6.5 12 8 12C9.5 12 10.5 11 10.5 9.5C10.5 8 9.5 7 8 7Z" fill="white"/>
      <path d="M16 7C14.5 7 13.5 8 13.5 9.5C13.5 11 14.5 12 16 12C17.5 12 18.5 11 18.5 9.5C18.5 8 17.5 7 16 7Z" fill="white"/>
      <rect x="11" y="12" width="2" height="9" fill="white"/>
    </svg>
  `

  return new L.DivIcon({
    html: `<div style="
      width: 24px; 
      height: 24px; 
      border-radius: 50%; 
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s ease;
    ">${svgIcon}</div>`,
    className: 'custom-tree-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  })
}

const TreeMarkers = ({ trees, onMarkerClick }: TreeMarkersProps) => {
  return (
    <>
      {trees.map((tree) => (
        <Marker
          key={tree.id}
          position={[tree.latitude, tree.longitude]}
          icon={createTokyoTreeIcon(tree.health)}
          eventHandlers={{
            click: () => onMarkerClick(tree),
          }}
        />
      ))}
    </>
  )
}

export default TreeMarkers