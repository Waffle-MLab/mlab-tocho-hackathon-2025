import { useEffect, ReactNode, useRef } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import './CustomMarker.css'
import { setGlobalMapInstance } from './ZoomControls'
import L from 'leaflet'

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as L.Icon.Default & { _getIconUrl?: unknown })._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

interface MapProps {
  center?: [number, number]
  zoom?: number
  className?: string
  children?: ReactNode
  onMapClick?: () => void
  flyToLocation?: [number, number] | null
}

// Component to handle map click events and fly-to functionality
const MapController = ({ onMapClick, flyToLocation }: { onMapClick?: () => void, flyToLocation?: [number, number] | null }) => {
  const map = useMap()

  // マップインスタンスをグローバルに設定
  useEffect(() => {
    setGlobalMapInstance(map)
  }, [map])

  useEffect(() => {
    const handleClick = () => {
      if (onMapClick) {
        onMapClick()
      }
    }

    map.on('click', handleClick)
    return () => {
      map.off('click', handleClick)
    }
  }, [map, onMapClick])

  useEffect(() => {
    if (flyToLocation) {
      map.flyTo(flyToLocation, map.getZoom() > 14 ? map.getZoom() : 16, {
        animate: true,
        duration: 1
      })
    }
  }, [map, flyToLocation])

  return null
}

const Map = ({ center = [35.6762, 139.6503], zoom = 10, className, children, onMapClick, flyToLocation }: MapProps) => {
  const mapRef = useRef<L.Map | null>(null)

  useEffect(() => {
    // Initialize map settings if needed
  }, [])

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className={className}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={true}
      zoomControl={false}
      ref={mapRef}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}{r}.png"
        subdomains="abcd"
        maxZoom={20}
      />
      <MapController onMapClick={onMapClick} flyToLocation={flyToLocation} />
      {/* <ZoomControls isExpanded={sidebarExpanded} /> */}
      {children}
    </MapContainer>
  )
}

export default Map