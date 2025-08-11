import { Marker } from 'react-leaflet'
import { JindaiTreeMarkerData } from '../types/tree'
import L from 'leaflet'

interface JindaiTreeMarkersProps {
  trees: JindaiTreeMarkerData[]
  onMarkerClick: (tree: JindaiTreeMarkerData) => void
}

// Custom beautiful tree icon with SVG
const createTreeIcon = (condition: string) => {
  const getColor = (condition: string) => {
    switch (condition) {
      case '健全':
        return '#22c55e' // Green
      case '要観察':
        return '#f59e0b' // Orange
      case '虫害':
        return '#ef4444' // Red
      case '立ち枯れ':
        return '#6b7280' // Gray
      default:
        return '#3b82f6' // Blue
    }
  }

  const color = getColor(condition)
  
  const svgIcon = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" fill="${color}" stroke="white" stroke-width="2"/>
      <path d="M12 2L10.5 6.5H6L9.5 9.5L8 14L12 11.5L16 14L14.5 9.5L18 6.5H13.5L12 2Z" fill="white"/>
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

const JindaiTreeMarkers = ({ trees, onMarkerClick }: JindaiTreeMarkersProps) => {
  return (
    <>
      {trees.map((tree) => (
        <Marker
          key={tree.id}
          position={[tree.latitude, tree.longitude]}
          icon={createTreeIcon(tree.condition)}
          eventHandlers={{
            click: () => onMarkerClick(tree),
          }}
        />
      ))}
    </>
  )
}

export default JindaiTreeMarkers