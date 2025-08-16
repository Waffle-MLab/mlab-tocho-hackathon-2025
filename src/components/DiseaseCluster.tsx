import { Polygon, Popup } from 'react-leaflet'
import { ClusterData } from '../utils/clustering'

interface DiseaseClusterProps {
  clusters: ClusterData[]
  year: number
}

const DiseaseCluster = ({ clusters, year }: DiseaseClusterProps) => {
  return (
    <>
      {clusters.map((cluster) => {
        // 簡単な円形近似でポリゴンを作成
        const polygon = createSimplePolygon(cluster)
        
        // Count trees by condition
        const conditionCounts = cluster.trees.reduce((acc, tree) => {
          acc[tree.condition] = (acc[tree.condition] || 0) + 1
          return acc
        }, {} as Record<string, number>)

        // Get severity level for color
        const hasDeadTrees = conditionCounts['枯死'] || conditionCounts['立ち枯れ']
        const hasPestDamage = conditionCounts['虫害']
        
        const color = hasDeadTrees ? '#dc2626' : hasPestDamage ? '#f59e0b' : '#ef4444'
        const opacity = hasDeadTrees ? 0.7 : hasPestDamage ? 0.6 : 0.5

        return (
          <Polygon
            key={`${cluster.id}-${year}`}
            positions={polygon}
            pathOptions={{
              fillColor: color,
              fillOpacity: 0.2,
              color: color,
              weight: 2,
              opacity: opacity,
            }}
          >
            <Popup>
              <div style={{ minWidth: '200px' }}>
                <h4>感染症クラスター ({year}年)</h4>
                <p><strong>影響樹木数:</strong> {cluster.trees.length}本</p>
                <div>
                  <strong>状態別内訳:</strong>
                  <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                    {Object.entries(conditionCounts).map(([condition, count]) => (
                      <li key={condition}>
                        <span style={{
                          color: condition === '枯死' || condition === '立ち枯れ' ? '#dc2626' :
                                condition === '虫害' ? '#f59e0b' : '#6b7280'
                        }}>
                          {condition}: {count}本
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <p><strong>範囲:</strong></p>
                <p style={{ fontSize: '0.85em', color: '#666' }}>
                  緯度: {cluster.bounds.minLat.toFixed(5)} ~ {cluster.bounds.maxLat.toFixed(5)}<br/>
                  経度: {cluster.bounds.minLng.toFixed(5)} ~ {cluster.bounds.maxLng.toFixed(5)}
                </p>
              </div>
            </Popup>
          </Polygon>
        )
      })}
    </>
  )
}

// 簡単な円形ポリゴン作成関数
const createSimplePolygon = (cluster: ClusterData): [number, number][] => {
  if (cluster.circles.length === 0) return []
  
  // 最初の円を基準にした簡単な円形ポリゴン
  const circle = cluster.circles[0]
  const points: [number, number][] = []
  const numPoints = 16
  
  // メートルを度に変換（簡易）
  const radiusInDegrees = circle.radius / 111320
  
  for (let i = 0; i < numPoints; i++) {
    const angle = (i * 2 * Math.PI) / numPoints
    const lat = circle.center[0] + radiusInDegrees * Math.cos(angle)
    const lng = circle.center[1] + radiusInDegrees * Math.sin(angle) / Math.cos(circle.center[0] * Math.PI / 180)
    points.push([lat, lng])
  }
  
  return points
}

export default DiseaseCluster