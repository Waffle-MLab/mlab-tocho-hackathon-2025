import Papa from 'papaparse'
import { TreeMarkerData, JindaiTreeMarkerData, TimeSeriesTreeMarkerData, DataSource } from '../types/tree'

export const loadTokyoTreeData = async (): Promise<TreeMarkerData[]> => {
  try {
    const response = await fetch('/src/data/tokyo_gairoju.csv')
    const csvText = await response.text()
    
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: false,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            const data = results.data as string[][]
            // Skip header row
            const rows = data.slice(1)
            
            const treeData: TreeMarkerData[] = rows.map((row, index) => {
              const longitude = parseFloat(row[10])
              const latitude = parseFloat(row[11])
              
              // Skip rows with invalid coordinates
              if (isNaN(longitude) || isNaN(latitude)) {
                return null
              }
              
              return {
                id: `tokyo-tree-${index}`,
                species: row[0] || 'Unknown',
                health: row[1] || 'Unknown',
                height: parseFloat(row[2]) || 0,
                circumference: parseFloat(row[3]) || 0,
                diameter: parseFloat(row[4]) || 0,
                district: row[5] || '',
                address: row[6] || '',
                managementNumber: parseInt(row[7]) || 0,
                administrativeArea: row[8] || '',
                townName: row[9] || '',
                longitude,
                latitude,
              }
            }).filter(Boolean) as TreeMarkerData[]
            
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
    console.error('Failed to load Tokyo CSV data:', error)
    throw error
  }
}

export const loadJindaiTreeData = async (): Promise<JindaiTreeMarkerData[]> => {
  try {
    const response = await fetch('/src/data/jindai_trees_demo.csv')
    const csvText = await response.text()
    
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            const data = results.data as Record<string, string>[]
            
            const treeData: JindaiTreeMarkerData[] = data.map((row, index) => {
              const longitude = parseFloat(row['経度'])
              const latitude = parseFloat(row['緯度'])
              
              // Skip rows with invalid coordinates
              if (isNaN(longitude) || isNaN(latitude)) {
                return null
              }
              
              return {
                id: `jindai-tree-${index}`,
                number: parseInt(row['番号']) || 0,
                treeId: row['樹木ID'] || '',
                species: row['樹種名'] || 'Unknown',
                location: row['立地'] || '',
                circumference: parseFloat(row['木の周囲(cm)']) || 0,
                height: parseFloat(row['樹高(m)']) || 0,
                condition: row['状態'] || '',
                notes: row['備考'] || '',
                latitude,
                longitude,
              }
            }).filter(Boolean) as JindaiTreeMarkerData[]
            
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
    console.error('Failed to load Jindai CSV data:', error)
    throw error
  }
}

export const loadTimeSeriesTreeData = async (): Promise<TimeSeriesTreeMarkerData[]> => {
  try {
    const response = await fetch('/src/data/jindai_trees_2015_2025.csv')
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

export const loadTreeData = async (dataSource: DataSource) => {
  switch (dataSource) {
    case 'tokyo':
      return await loadTokyoTreeData()
    case 'jindai':
      return await loadJindaiTreeData()
    case 'timeseries':
      return await loadTimeSeriesTreeData()
    default:
      throw new Error(`Unknown data source: ${dataSource}`)
  }
}