import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import { ClusterData } from '../utils/clustering'

interface SVGClusterOverlayProps {
  clusters: ClusterData[]
  year: number
  overlapThreshold?: number
}

const SVGClusterOverlay = ({ clusters, year, overlapThreshold = 0.3 }: SVGClusterOverlayProps) => {
  const map = useMap()
  const svgElementRef = useRef<SVGSVGElement | null>(null)
  const overlayRef = useRef<L.SVGOverlay | null>(null)

  useEffect(() => {
    if (!map || clusters.length === 0) return

    // SVG要素を作成
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.style.pointerEvents = 'auto'
    svgElementRef.current = svg

    // 各クラスターを円として描画し、重なる部分を結合
    clusters.forEach((cluster) => {
      // 各問題樹木を円として描画
      const circles = cluster.circles.map((circle) => {
        const point = map.latLngToLayerPoint([circle.center[0], circle.center[1]])
        const radiusInPixels = calculateRadiusInPixels(map, circle.center, circle.radius)
        
        return {
          cx: point.x,
          cy: point.y,
          r: radiusInPixels,
          originalRadius: circle.radius
        }
      })

      // SVGパスで円の結合を作成
      const mergedPath = createMergedCirclePath(circles, overlapThreshold)
      
      if (mergedPath) {
        const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        pathElement.setAttribute('d', mergedPath)
        
        // クラスターの色を決定
        const conditionCounts = cluster.trees.reduce((acc, tree) => {
          acc[tree.condition] = (acc[tree.condition] || 0) + 1
          return acc
        }, {} as Record<string, number>)

        const hasDeadTrees = conditionCounts['枯死'] || conditionCounts['立ち枯れ']
        const hasPestDamage = conditionCounts['虫害']
        
        const color = hasDeadTrees ? '#dc2626' : hasPestDamage ? '#f59e0b' : '#ef4444'
        const opacity = hasDeadTrees ? 0.7 : hasPestDamage ? 0.6 : 0.5

        pathElement.setAttribute('fill', color)
        pathElement.setAttribute('fill-opacity', '0.2')
        pathElement.setAttribute('stroke', color)
        pathElement.setAttribute('stroke-width', '2')
        pathElement.setAttribute('stroke-opacity', opacity.toString())
        pathElement.setAttribute('data-cluster-id', cluster.id)
        
        // ツールチップ情報を追加
        pathElement.addEventListener('mouseenter', (e) => {
          showTooltip(e, cluster, year)
        })
        
        pathElement.addEventListener('mouseleave', hideTooltip)
        
        svg.appendChild(pathElement)
      }
    })

    // 地図の境界を取得してSVGオーバーレイを配置
    const bounds = map.getBounds()
    const topLeft = map.latLngToLayerPoint(bounds.getNorthWest())
    const bottomRight = map.latLngToLayerPoint(bounds.getSouthEast())
    
    const svgBounds = L.latLngBounds(
      map.layerPointToLatLng(topLeft),
      map.layerPointToLatLng(bottomRight)
    )

    svg.setAttribute('width', (bottomRight.x - topLeft.x).toString())
    svg.setAttribute('height', (bottomRight.y - topLeft.y).toString())
    svg.setAttribute('viewBox', `${topLeft.x} ${topLeft.y} ${bottomRight.x - topLeft.x} ${bottomRight.y - topLeft.y}`)

    // SVGオーバーレイを地図に追加
    const svgOverlay = L.svgOverlay(svg, svgBounds, {
      opacity: 1,
      interactive: true
    })
    
    svgOverlay.addTo(map)
    overlayRef.current = svgOverlay

    // 地図の移動やズームに対応
    const updateSVG = () => {
      if (overlayRef.current) {
        map.removeLayer(overlayRef.current)
      }
      // 再描画（簡略化）
    }

    map.on('zoom', updateSVG)
    map.on('move', updateSVG)

    return () => {
      if (overlayRef.current) {
        map.removeLayer(overlayRef.current)
      }
      map.off('zoom', updateSVG)
      map.off('move', updateSVG)
    }
  }, [map, clusters, year, overlapThreshold])

  return null
}

/**
 * 円の半径をピクセル単位で計算
 */
const calculateRadiusInPixels = (map: L.Map, center: [number, number], radiusInMeters: number): number => {
  const centerPoint = map.latLngToLayerPoint(center)
  const radiusPoint = map.latLngToLayerPoint([
    center[0] + (radiusInMeters / 111320), // 緯度の変化
    center[1]
  ])
  return Math.abs(centerPoint.y - radiusPoint.y)
}

/**
 * 複数の円を結合したSVGパスを作成
 */
const createMergedCirclePath = (circles: Array<{cx: number, cy: number, r: number}>, overlapThreshold: number): string => {
  if (circles.length === 0) return ''
  
  if (circles.length === 1) {
    // 単一の円
    const c = circles[0]
    return `M ${c.cx - c.r} ${c.cy} 
            A ${c.r} ${c.r} 0 1 0 ${c.cx + c.r} ${c.cy}
            A ${c.r} ${c.r} 0 1 0 ${c.cx - c.r} ${c.cy} Z`
  }

  // 複数の円の場合、重なり合いを検出して結合
  const mergedCircles = mergeOverlappingCircles(circles, overlapThreshold)
  
  // 結合された円群の外周を計算
  return createUnionPath(mergedCircles)
}

/**
 * 重なり合う円を検出して結合
 */
const mergeOverlappingCircles = (circles: Array<{cx: number, cy: number, r: number}>, overlapThreshold: number): Array<{cx: number, cy: number, r: number}> => {
  const merged: Array<{cx: number, cy: number, r: number}> = []
  const processed = new Set<number>()

  for (let i = 0; i < circles.length; i++) {
    if (processed.has(i)) continue

    const currentGroup = [circles[i]]
    processed.add(i)

    // この円と重なる全ての円を見つける
    let foundOverlap = true
    while (foundOverlap) {
      foundOverlap = false
      for (let j = 0; j < circles.length; j++) {
        if (processed.has(j)) continue

        // currentGroupのいずれかの円と重なるかチェック（厳しい閾値）
        for (const groupCircle of currentGroup) {
          const distance = Math.sqrt(
            Math.pow(circles[j].cx - groupCircle.cx, 2) + 
            Math.pow(circles[j].cy - groupCircle.cy, 2)
          )
          
          // より厳しい結合条件：設定された重なり割合以上の場合のみ結合
          const minRadius = Math.min(circles[j].r, groupCircle.r)
          const maxRadius = Math.max(circles[j].r, groupCircle.r)
          const strictThreshold = maxRadius + minRadius * (1 - overlapThreshold)
          
          if (distance <= strictThreshold) {
            currentGroup.push(circles[j])
            processed.add(j)
            foundOverlap = true
            break
          }
        }
      }
    }

    // グループの外接円を計算
    if (currentGroup.length === 1) {
      merged.push(currentGroup[0])
    } else {
      const boundingCircle = calculateBoundingCircle(currentGroup)
      merged.push(boundingCircle)
    }
  }

  return merged
}

/**
 * 複数の円を包む最小の円を計算
 */
const calculateBoundingCircle = (circles: Array<{cx: number, cy: number, r: number}>): {cx: number, cy: number, r: number} => {
  // 重心を計算
  const centerX = circles.reduce((sum, c) => sum + c.cx, 0) / circles.length
  const centerY = circles.reduce((sum, c) => sum + c.cy, 0) / circles.length

  // 最大距離を計算
  let maxDistance = 0
  for (const circle of circles) {
    const distance = Math.sqrt(Math.pow(circle.cx - centerX, 2) + Math.pow(circle.cy - centerY, 2)) + circle.r
    maxDistance = Math.max(maxDistance, distance)
  }

  return {
    cx: centerX,
    cy: centerY,
    r: maxDistance
  }
}

/**
 * 結合された円群の外周パスを作成
 */
const createUnionPath = (circles: Array<{cx: number, cy: number, r: number}>): string => {
  if (circles.length === 1) {
    const c = circles[0]
    return `M ${c.cx - c.r} ${c.cy} 
            A ${c.r} ${c.r} 0 1 0 ${c.cx + c.r} ${c.cy}
            A ${c.r} ${c.r} 0 1 0 ${c.cx - c.r} ${c.cy} Z`
  }

  // 複数の円の場合は、convex hullで近似
  const points: Array<{x: number, y: number}> = []
  const resolution = 16

  for (const circle of circles) {
    for (let i = 0; i < resolution; i++) {
      const angle = (i * 2 * Math.PI) / resolution
      points.push({
        x: circle.cx + circle.r * Math.cos(angle),
        y: circle.cy + circle.r * Math.sin(angle)
      })
    }
  }

  // Convex hullを計算
  const hull = convexHull(points)
  
  if (hull.length < 3) return ''

  let path = `M ${hull[0].x} ${hull[0].y}`
  for (let i = 1; i < hull.length; i++) {
    path += ` L ${hull[i].x} ${hull[i].y}`
  }
  path += ' Z'

  return path
}

/**
 * Graham scan convex hull算法
 */
const convexHull = (points: Array<{x: number, y: number}>): Array<{x: number, y: number}> => {
  if (points.length < 3) return points

  // 最下点を見つける
  let start = 0
  for (let i = 1; i < points.length; i++) {
    if (points[i].y < points[start].y || 
        (points[i].y === points[start].y && points[i].x < points[start].x)) {
      start = i
    }
  }

  const startPoint = points[start]
  const sortedPoints = points.slice()
  sortedPoints.splice(start, 1)

  // 角度でソート
  sortedPoints.sort((a, b) => {
    const angleA = Math.atan2(a.y - startPoint.y, a.x - startPoint.x)
    const angleB = Math.atan2(b.y - startPoint.y, b.x - startPoint.x)
    return angleA - angleB
  })

  const hull = [startPoint, sortedPoints[0]]

  for (let i = 1; i < sortedPoints.length; i++) {
    while (hull.length > 1 && crossProduct(hull[hull.length-2], hull[hull.length-1], sortedPoints[i]) <= 0) {
      hull.pop()
    }
    hull.push(sortedPoints[i])
  }

  return hull
}

const crossProduct = (O: {x: number, y: number}, A: {x: number, y: number}, B: {x: number, y: number}): number => {
  return (A.x - O.x) * (B.y - O.y) - (A.y - O.y) * (B.x - O.x)
}

// ツールチップ機能
let tooltipElement: HTMLDivElement | null = null

const showTooltip = (event: MouseEvent, cluster: ClusterData, year: number) => {
  hideTooltip()
  
  tooltipElement = document.createElement('div')
  tooltipElement.style.cssText = `
    position: fixed;
    background: white;
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    font-size: 12px;
    z-index: 1000;
    pointer-events: none;
    max-width: 200px;
  `
  
  const conditionCounts = cluster.trees.reduce((acc, tree) => {
    acc[tree.condition] = (acc[tree.condition] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  tooltipElement.innerHTML = `
    <h4 style="margin: 0 0 4px 0;">感染症クラスター (${year}年)</h4>
    <p style="margin: 2px 0;"><strong>影響樹木数:</strong> ${cluster.trees.length}本</p>
    <div style="margin: 4px 0;">
      <strong>状態別内訳:</strong>
      ${Object.entries(conditionCounts).map(([condition, count]) => 
        `<div style="margin: 1px 0; color: ${
          condition === '枯死' || condition === '立ち枯れ' ? '#dc2626' :
          condition === '虫害' ? '#f59e0b' : '#6b7280'
        };">${condition}: ${count}本</div>`
      ).join('')}
    </div>
  `
  
  tooltipElement.style.left = event.pageX + 10 + 'px'
  tooltipElement.style.top = event.pageY - 10 + 'px'
  
  document.body.appendChild(tooltipElement)
}

const hideTooltip = () => {
  if (tooltipElement) {
    document.body.removeChild(tooltipElement)
    tooltipElement = null
  }
}

export default SVGClusterOverlay