import Papa from 'papaparse'
import { TimeSeriesTreeMarkerData } from '../types/tree'

export const loadTimeSeriesTreeData = async (): Promise<
  TimeSeriesTreeMarkerData[]
> => {
  try {
    const response = await fetch('/data/jindai_trees_2015_2025.csv')
    const csvText = await response.text()

    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            const data = results.data as Record<string, string>[]

            const treeData: TimeSeriesTreeMarkerData[] = data
              .map((row) => {
                const longitude = parseFloat(row['経度'])
                const latitude = parseFloat(row['緯度'])

                // Skip rows with invalid coordinates
                if (isNaN(longitude) || isNaN(latitude)) {
                  return null
                }

                return {
                  id: `timeseries-tree-${row['年度']}-${row['番号']}`,
                  year: parseInt(row['年度']) || 0,
                  number: parseInt(row['番号']) || 0,
                  treeId: row['樹木ID'] || '',
                  species: row['樹種名'] || 'Unknown',
                  location: row['立地'] || '',
                  circumference: parseFloat(row['木の周囲_cm']) || 0,
                  height: parseFloat(row['樹高_m']) || 0,
                  condition: row['状態'] || '',
                  notes: row['備考'] || '',
                  latitude,
                  longitude,
                }
              })
              .filter(Boolean) as TimeSeriesTreeMarkerData[]

            resolve(treeData)
          } catch (error) {
            reject(error)
          }
        },
        error: (error: Error) => {
          reject(error)
        },
      })
    })
  } catch (error) {
    console.error('Failed to load time series CSV data:', error)
    throw error
  }
}

const LOAD_ROW_LIMIT = 500

export const loadSimpleTreeData = async (): Promise<
  TimeSeriesTreeMarkerData[]
> => {
  try {
    const response = await fetch('/data/tree.csv')
    const csvText = await response.text()

    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            const data = results.data as Record<string, string>[]
            const limitedData = data.slice(0, LOAD_ROW_LIMIT) // Limit to 2000 rows
            let counter = 0 // To generate unique IDs

            const treeData: TimeSeriesTreeMarkerData[] = limitedData
              .map((row) => {
                const longitude = parseFloat(row['経度'])
                const latitude = parseFloat(row['緯度'])

                // Skip rows with invalid coordinates
                if (isNaN(longitude) || isNaN(latitude)) {
                  return null
                }
                counter++
                const currentYear = new Date().getFullYear() // Get current year for default

                return {
                  id: `simple-tree-${counter}`, // Unique ID for simple trees
                  year: currentYear, // Default to current year
                  number: counter, // Use counter for number
                  treeId: `SIMPLE-${counter}`, // Unique treeId for simple trees
                  species: row['樹木種'] || 'Unknown',
                  location: '不明', // Default value
                  circumference: 0, // Default value
                  height: 0, // Default value
                  condition: '不明', // Default value
                  notes: 'tree.csvからのデータ', // Default note
                  latitude,
                  longitude,
                }
              })
              .filter(Boolean) as TimeSeriesTreeMarkerData[]

            resolve(treeData)
          } catch (error) {
            reject(error)
          }
        },
        error: (error: Error) => {
          reject(error)
        },
      })
    })
  } catch (error) {
    console.error('Failed to load simple tree CSV data:', error)
    throw error
  }
}

export const loadTreeData = async (): Promise<TimeSeriesTreeMarkerData[]> => {
  const timeSeriesData = await loadTimeSeriesTreeData()
  const simpleTreeData = await loadSimpleTreeData()
  return [...timeSeriesData, ...simpleTreeData]
}
