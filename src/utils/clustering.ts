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
}

// Improved clustering algorithm using DBSCAN-like approach
export const clusterTrees = (
  trees: TimeSeriesTreeMarkerData[],
  maxDistanceInMeters: number = 100 // Distance in meters
): ClusterData[] => {
  // Convert meters to degrees (approximate: 1 degree ≈ 111,320 meters)
  const maxDistance = maxDistanceInMeters / 111320
  const minPoints = 3 // Minimum points to form a dense cluster
  
  if (trees.length === 0) return []

  // Filter for trees with concerning conditions
  const concerningTrees = trees.filter(tree => 
    tree.condition === '枯死' || 
    tree.condition === '立ち枯れ' ||
    tree.condition === '虫害'
  )

  if (concerningTrees.length < minPoints) return []

  // DBSCAN-like clustering
  const visited = new Set<number>()
  const clusters: ClusterData[] = []
  
  for (let i = 0; i < concerningTrees.length; i++) {
    if (visited.has(i)) continue
    
    const neighbors = findNeighbors(concerningTrees, i, maxDistance)
    
    if (neighbors.length < minPoints) {
      visited.add(i) // Mark as noise
      continue
    }
    
    // Start new cluster
    const cluster: ClusterData = {
      id: `cluster-${clusters.length}`,
      trees: [],
      bounds: {
        minLat: Infinity,
        maxLat: -Infinity,
        minLng: Infinity,
        maxLng: -Infinity
      },
      center: [0, 0]
    }
    
    // Process cluster using queue-based expansion
    const queue = [i]
    
    while (queue.length > 0) {
      const currentIdx = queue.shift()!
      if (visited.has(currentIdx)) continue
      
      visited.add(currentIdx)
      const currentTree = concerningTrees[currentIdx]
      cluster.trees.push(currentTree)
      
      // Update bounds
      cluster.bounds.minLat = Math.min(cluster.bounds.minLat, currentTree.latitude)
      cluster.bounds.maxLat = Math.max(cluster.bounds.maxLat, currentTree.latitude)
      cluster.bounds.minLng = Math.min(cluster.bounds.minLng, currentTree.longitude)
      cluster.bounds.maxLng = Math.max(cluster.bounds.maxLng, currentTree.longitude)
      
      // Find neighbors of current point
      const currentNeighbors = findNeighbors(concerningTrees, currentIdx, maxDistance)
      
      if (currentNeighbors.length >= minPoints) {
        // Add unvisited neighbors to queue
        for (const neighborIdx of currentNeighbors) {
          if (!visited.has(neighborIdx)) {
            queue.push(neighborIdx)
          }
        }
      }
    }
    
    // Calculate cluster center
    if (cluster.trees.length > 0) {
      const avgLat = cluster.trees.reduce((sum, t) => sum + t.latitude, 0) / cluster.trees.length
      const avgLng = cluster.trees.reduce((sum, t) => sum + t.longitude, 0) / cluster.trees.length
      cluster.center = [avgLat, avgLng]
      clusters.push(cluster)
    }
  }

  // Post-process: merge very close clusters to create smooth connections
  return mergeOverlappingClusters(clusters, maxDistance * 0.8)
}

// Find neighbors within distance
const findNeighbors = (
  trees: TimeSeriesTreeMarkerData[],
  pointIndex: number,
  maxDistance: number
): number[] => {
  const neighbors: number[] = []
  const point = trees[pointIndex]
  
  for (let i = 0; i < trees.length; i++) {
    if (i === pointIndex) continue
    
    const distance = calculateDistance(
      point.latitude,
      point.longitude,
      trees[i].latitude,
      trees[i].longitude
    )
    
    if (distance <= maxDistance) {
      neighbors.push(i)
    }
  }
  
  return neighbors
}

// Calculate distance between two points in degrees (approximate)
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const deltaLat = lat2 - lat1
  const deltaLng = lng2 - lng1
  return Math.sqrt(deltaLat * deltaLat + deltaLng * deltaLng)
}

// Merge overlapping clusters to create smooth connections
const mergeOverlappingClusters = (clusters: ClusterData[], mergeDistance: number): ClusterData[] => {
  if (clusters.length <= 1) return clusters

  const merged: ClusterData[] = []
  const processed = new Set<string>()
  
  for (const cluster of clusters) {
    if (processed.has(cluster.id)) continue
    
    const mergedCluster = { ...cluster, trees: [...cluster.trees] }
    processed.add(cluster.id)
    
    // Find all clusters that should be connected to this one
    const connectedClusters = findConnectedClusters(cluster, clusters, mergeDistance, processed)
    
    for (const connected of connectedClusters) {
      if (!processed.has(connected.id)) {
        // Merge trees
        mergedCluster.trees.push(...connected.trees)
        processed.add(connected.id)
        
        // Update bounds to encompass all merged clusters
        mergedCluster.bounds.minLat = Math.min(mergedCluster.bounds.minLat, connected.bounds.minLat)
        mergedCluster.bounds.maxLat = Math.max(mergedCluster.bounds.maxLat, connected.bounds.maxLat)
        mergedCluster.bounds.minLng = Math.min(mergedCluster.bounds.minLng, connected.bounds.minLng)
        mergedCluster.bounds.maxLng = Math.max(mergedCluster.bounds.maxLng, connected.bounds.maxLng)
      }
    }
    
    // Recalculate center
    if (mergedCluster.trees.length > 0) {
      const avgLat = mergedCluster.trees.reduce((sum, t) => sum + t.latitude, 0) / mergedCluster.trees.length
      const avgLng = mergedCluster.trees.reduce((sum, t) => sum + t.longitude, 0) / mergedCluster.trees.length
      mergedCluster.center = [avgLat, avgLng]
      merged.push(mergedCluster)
    }
  }
  
  return merged
}

// Find all clusters that should be connected to form a continuous area
const findConnectedClusters = (
  baseCluster: ClusterData,
  allClusters: ClusterData[],
  maxDistance: number,
  processed: Set<string>
): ClusterData[] => {
  const connected: ClusterData[] = []
  const queue = [baseCluster]
  const visited = new Set<string>([baseCluster.id])
  
  while (queue.length > 0) {
    const current = queue.shift()!
    
    for (const other of allClusters) {
      if (visited.has(other.id) || processed.has(other.id)) continue
      
      // Check if clusters are close enough to be connected
      if (shouldConnectClusters(current, other, maxDistance)) {
        connected.push(other)
        queue.push(other)
        visited.add(other.id)
      }
    }
  }
  
  return connected
}

// Determine if two clusters should be connected based on proximity
const shouldConnectClusters = (
  cluster1: ClusterData,
  cluster2: ClusterData,
  maxDistance: number
): boolean => {
  // Check distance between centers
  const centerDistance = calculateDistance(
    cluster1.center[0],
    cluster1.center[1],
    cluster2.center[0],
    cluster2.center[1]
  )
  
  if (centerDistance <= maxDistance) return true
  
  // Check if any tree in cluster1 is close to any tree in cluster2
  for (const tree1 of cluster1.trees) {
    for (const tree2 of cluster2.trees) {
      const treeDistance = calculateDistance(
        tree1.latitude,
        tree1.longitude,
        tree2.latitude,
        tree2.longitude
      )
      
      if (treeDistance <= maxDistance * 1.2) { // Slightly larger distance for edge connection
        return true
      }
    }
  }
  
  return false
}

// Calculate convex hull using Graham scan algorithm
const convexHull = (points: [number, number][]): [number, number][] => {
  if (points.length < 3) return points

  // Find the bottom-most point (or left most in case of tie)
  let start = 0
  for (let i = 1; i < points.length; i++) {
    if (points[i][0] < points[start][0] || 
        (points[i][0] === points[start][0] && points[i][1] < points[start][1])) {
      start = i
    }
  }

  // Sort points by polar angle with respect to start point
  const sorted = points.slice()
  const startPoint = sorted[start]
  sorted.splice(start, 1)
  
  sorted.sort((a, b) => {
    const angleA = Math.atan2(a[0] - startPoint[0], a[1] - startPoint[1])
    const angleB = Math.atan2(b[0] - startPoint[0], b[1] - startPoint[1])
    return angleA - angleB
  })

  const hull = [startPoint, sorted[0]]
  
  for (let i = 1; i < sorted.length; i++) {
    // Remove points that make clockwise turn
    while (hull.length > 1 && crossProduct(hull[hull.length-2], hull[hull.length-1], sorted[i]) <= 0) {
      hull.pop()
    }
    hull.push(sorted[i])
  }

  return hull
}

// Calculate cross product to determine turn direction
const crossProduct = (O: [number, number], A: [number, number], B: [number, number]): number => {
  return (A[0] - O[0]) * (B[1] - O[1]) - (A[1] - O[1]) * (B[0] - O[0])
}


// Get cluster polygon points for rendering with smooth path-like boundaries
export const getClusterPolygon = (cluster: ClusterData): [number, number][] => {
  const points: [number, number][] = cluster.trees.map(tree => [tree.latitude, tree.longitude])
  const padding = 0.0006 // Adjusted padding for smoother path-like shapes
  
  if (points.length < 3) {
    // For very small clusters, create a simple circle
    return createCircularPath(cluster.center, padding * 1.5)
  }
  
  if (points.length < 6) {
    // For small clusters, use convex hull with heavy smoothing
    const hull = convexHull(points)
    return createSmoothPath(hull, padding)
  }
  
  // For larger clusters, use alpha shape algorithm for natural boundaries
  return createAlphaShape(points, padding)
}

// Create a circular path for very small clusters
const createCircularPath = (center: [number, number], radius: number): [number, number][] => {
  const numPoints = 12
  const circle: [number, number][] = []
  
  for (let i = 0; i < numPoints; i++) {
    const angle = (i * 2 * Math.PI) / numPoints
    const lat = center[0] + radius * Math.cos(angle)
    const lng = center[1] + radius * Math.sin(angle)
    circle.push([lat, lng])
  }
  
  return circle
}

// Create alpha shape - a more natural boundary following the shape of points
const createAlphaShape = (points: [number, number][], padding: number): [number, number][] => {
  // Simplified alpha shape using concave hull approximation
  const hull = concaveHull(points, 3) // Factor of 3 for moderate concavity
  return createSmoothPath(hull, padding)
}

// Concave hull algorithm for more natural shapes than convex hull
const concaveHull = (points: [number, number][], k: number): [number, number][] => {
  if (points.length < 4) return convexHull(points)
  
  // Start with convex hull
  let hull = convexHull(points)
  
  // Iteratively add concave features
  let changed = true
  const maxIterations = 3
  let iteration = 0
  
  while (changed && iteration < maxIterations) {
    changed = false
    iteration++
    
    const newHull: [number, number][] = []
    
    for (let i = 0; i < hull.length; i++) {
      const current = hull[i]
      const next = hull[(i + 1) % hull.length]
      newHull.push(current)
      
      // Find the best point to add between current and next
      const candidatePoint = findBestInsertionPoint(current, next, points, hull, k)
      if (candidatePoint) {
        newHull.push(candidatePoint)
        changed = true
      }
    }
    
    hull = newHull
  }
  
  return hull
}

// Find the best point to insert between two hull points
const findBestInsertionPoint = (
  p1: [number, number],
  p2: [number, number],
  allPoints: [number, number][],
  currentHull: [number, number][],
  k: number
): [number, number] | null => {
  let bestPoint: [number, number] | null = null
  let minDistance = Infinity
  
  for (const point of allPoints) {
    // Skip if point is already in hull
    if (currentHull.some(hp => hp[0] === point[0] && hp[1] === point[1])) continue
    
    // Check if point is close enough to the edge
    const distToEdge = pointToLineDistance(point, p1, p2)
    const distToP1 = calculateDistance(point[0], point[1], p1[0], p1[1])
    const distToP2 = calculateDistance(point[0], point[1], p2[0], p2[1])
    
    // Only consider points that create a reasonable angle
    const maxEdgeLength = calculateDistance(p1[0], p1[1], p2[0], p2[1])
    
    if (distToEdge < maxEdgeLength / k && distToEdge < minDistance && 
        distToP1 < maxEdgeLength * 2 && distToP2 < maxEdgeLength * 2) {
      bestPoint = point
      minDistance = distToEdge
    }
  }
  
  return bestPoint
}

// Calculate distance from point to line segment
const pointToLineDistance = (
  point: [number, number],
  lineStart: [number, number],
  lineEnd: [number, number]
): number => {
  const [px, py] = point
  const [x1, y1] = lineStart
  const [x2, y2] = lineEnd
  
  const A = px - x1
  const B = py - y1
  const C = x2 - x1
  const D = y2 - y1
  
  const dot = A * C + B * D
  const lenSq = C * C + D * D
  
  let param = -1
  if (lenSq !== 0) param = dot / lenSq
  
  let xx, yy
  
  if (param < 0) {
    xx = x1
    yy = y1
  } else if (param > 1) {
    xx = x2
    yy = y2
  } else {
    xx = x1 + param * C
    yy = y1 + param * D
  }
  
  const dx = px - xx
  const dy = py - yy
  return Math.sqrt(dx * dx + dy * dy)
}

// Create smooth path with Catmull-Rom spline
const createSmoothPath = (points: [number, number][], padding: number): [number, number][] => {
  if (points.length < 3) return points
  
  // Add padding to all points
  const paddedPoints = points.map((point, index) => {
    const angle = index * 2 * Math.PI / points.length
    const paddingLat = padding * Math.cos(angle)
    const paddingLng = padding * Math.sin(angle)
    return [point[0] + paddingLat, point[1] + paddingLng] as [number, number]
  })
  
  // Apply Catmull-Rom spline for smooth curves
  const smoothedPoints: [number, number][] = []
  const resolution = 8 // Points per segment
  
  for (let i = 0; i < paddedPoints.length; i++) {
    const p0 = paddedPoints[(i - 1 + paddedPoints.length) % paddedPoints.length]
    const p1 = paddedPoints[i]
    const p2 = paddedPoints[(i + 1) % paddedPoints.length]
    const p3 = paddedPoints[(i + 2) % paddedPoints.length]
    
    for (let t = 0; t < resolution; t++) {
      const tt = t / resolution
      const point = catmullRomSpline(p0, p1, p2, p3, tt)
      smoothedPoints.push(point)
    }
  }
  
  return smoothedPoints
}

// Catmull-Rom spline interpolation
const catmullRomSpline = (
  p0: [number, number],
  p1: [number, number], 
  p2: [number, number],
  p3: [number, number],
  t: number
): [number, number] => {
  const t2 = t * t
  const t3 = t2 * t
  
  const lat = 0.5 * (
    (2 * p1[0]) +
    (-p0[0] + p2[0]) * t +
    (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 +
    (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3
  )
  
  const lng = 0.5 * (
    (2 * p1[1]) +
    (-p0[1] + p2[1]) * t +
    (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 +
    (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3
  )
  
  return [lat, lng]
}