import Papa from 'papaparse'
import { TimeSeriesTreeMarkerData } from '../types/tree'

export const loadTimeSeriesTreeData = async (): Promise<TimeSeriesTreeMarkerData[]> => {
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
            
            const treeData: TimeSeriesTreeMarkerData[] = data.map((row) => {
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
            }).filter(Boolean) as TimeSeriesTreeMarkerData[]
            
            resolve(treeData)
          } catch (error) {
            reject(error)
          }
        },
        error: (error: Error) => {
          reject(error)
        }
      })
    })
  } catch (error) {
    console.error('Failed to load time series CSV data:', error)
    throw error
  }
}

export const loadTreeData = async () => {
  return await loadTimeSeriesTreeData()
}