import { TimeSeriesTreeMarkerData } from '../types/tree'

export interface ClusterData {
  id: string
  trees: TimeSeriesTreeMarkerData[]
  bounds: {
    minLat: number
    maxLat: number
    minLng: number
    maxLng: number
  }
  center: [number, number]
  circles: CircleZone[]  // 円形範囲の配列
}

interface CircleZone {
  center: [number, number]
  radius: number  // メートル単位
  trees: TimeSeriesTreeMarkerData[]
}

/**
 * 円形範囲ベースのクラスタリングアルゴリズム
 * イラレのパス結合のように、円形範囲が重なり合う部分を結合し、
 * 対象外の樹木がある部分は除外する
 */
export const clusterTrees = (
  trees: TimeSeriesTreeMarkerData[],
  radiusInMeters: number = 50, // 1m～設定可能な円の半径
  overlapThreshold: number = 0.3 // 結合するために必要な重なり割合
): ClusterData[] => {
  // 最小半径1mに制限
  const radius = Math.max(radiusInMeters, 1)
  
  if (trees.length === 0) return []

  // 問題のある樹木のみを対象にする
  const concerningTrees = trees.filter(tree => 
    tree.condition === '枯死' || 
    tree.condition === '立ち枯れ' ||
    tree.condition === '虫害'
  )

  if (concerningTrees.length === 0) return []

  // Step 1: 各問題樹木を中心とした円形範囲を作成
  const circles = concerningTrees.map((tree, index) => ({
    center: [tree.latitude, tree.longitude] as [number, number],
    radius,
    trees: [tree],
    id: `circle-${index}`
  }))

  // Step 2: 重なり合う円を結合してクラスターを形成
  const clusters = mergeOverlappingCircles(circles, overlapThreshold)

  // Step 3: 健全な樹木による除外処理（SVG側で処理）
  return clusters
}

/**
 * 重なり合う円形範囲を結合してクラスターを作成
 */
const mergeOverlappingCircles = (
  circles: Array<{center: [number, number], radius: number, trees: TimeSeriesTreeMarkerData[], id: string}>,
  overlapThreshold: number
): ClusterData[] => {
  const clusters: ClusterData[] = []
  const processed = new Set<string>()

  for (const circle of circles) {
    if (processed.has(circle.id)) continue

    // 新しいクラスターを開始
    const cluster: ClusterData = {
      id: `cluster-${clusters.length}`,
      trees: [...circle.trees],
      bounds: {
        minLat: Infinity,
        maxLat: -Infinity,
        minLng: Infinity,
        maxLng: -Infinity
      },
      center: [0, 0],
      circles: [circle]
    }

    processed.add(circle.id)

    // 接続する全ての円を見つける
    const connectedCircles = findConnectedCircles(circle, circles, processed, overlapThreshold)
    cluster.circles.push(...connectedCircles)

    // クラスター内の全樹木を統合
    for (const connectedCircle of connectedCircles) {
      cluster.trees.push(...connectedCircle.trees)
      processed.add(connectedCircle.id)
    }

    // 重複除去
    cluster.trees = cluster.trees.filter((tree, index, self) => 
      index === self.findIndex(t => t.id === tree.id)
    )

    // 境界とセンターを計算
    updateClusterBounds(cluster)

    clusters.push(cluster)
  }

  return clusters
}

/**
 * 指定した円に接続する全ての円を再帰的に見つける
 */
const findConnectedCircles = (
  startCircle: {center: [number, number], radius: number, trees: TimeSeriesTreeMarkerData[], id: string},
  allCircles: Array<{center: [number, number], radius: number, trees: TimeSeriesTreeMarkerData[], id: string}>,
  processed: Set<string>,
  overlapThreshold: number
): Array<{center: [number, number], radius: number, trees: TimeSeriesTreeMarkerData[], id: string}> => {
  const connected: Array<{center: [number, number], radius: number, trees: TimeSeriesTreeMarkerData[], id: string}> = []
  const queue = [startCircle]
  const visited = new Set<string>([startCircle.id])

  while (queue.length > 0) {
    const current = queue.shift()!

    for (const circle of allCircles) {
      if (visited.has(circle.id) || processed.has(circle.id)) continue

      // 円が重なり合うかチェック
      if (circlesOverlap(current, circle, overlapThreshold)) {
        connected.push(circle)
        queue.push(circle)
        visited.add(circle.id)
      }
    }
  }

  return connected
}

/**
 * 2つの円が重なり合うかチェック（厳しい閾値）
 */
const circlesOverlap = (
  circle1: {center: [number, number], radius: number},
  circle2: {center: [number, number], radius: number},
  overlapThreshold: number
): boolean => {
  const distance = calculateDistanceInMeters(
    circle1.center[0], circle1.center[1],
    circle2.center[0], circle2.center[1]
  )
  
  // より厳しい結合条件：設定された重なり割合以上の場合のみ結合
  const minRadius = Math.min(circle1.radius, circle2.radius)
  const maxRadius = Math.max(circle1.radius, circle2.radius)
  
  // 重なりが十分にある場合のみtrueを返す
  // 距離が (大きい円の半径 + 小さい円の半径 * (1 - 閾値)) 以下の場合
  const strictThreshold = maxRadius + minRadius * (1 - overlapThreshold)
  
  return distance <= strictThreshold
}

/**
 * より正確な距離計算（メートル単位）
 */
const calculateDistanceInMeters = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371000 // 地球の半径（メートル）
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

/**
 * クラスターの境界とセンターを更新
 */
const updateClusterBounds = (cluster: ClusterData): void => {
  if (cluster.trees.length === 0) return

  cluster.bounds.minLat = Math.min(...cluster.trees.map(t => t.latitude))
  cluster.bounds.maxLat = Math.max(...cluster.trees.map(t => t.latitude))
  cluster.bounds.minLng = Math.min(...cluster.trees.map(t => t.longitude))
  cluster.bounds.maxLng = Math.max(...cluster.trees.map(t => t.longitude))

  const avgLat = cluster.trees.reduce((sum, t) => sum + t.latitude, 0) / cluster.trees.length
  const avgLng = cluster.trees.reduce((sum, t) => sum + t.longitude, 0) / cluster.trees.length
  cluster.center = [avgLat, avgLng]
}





