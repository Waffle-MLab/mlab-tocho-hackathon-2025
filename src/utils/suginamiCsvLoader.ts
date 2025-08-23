import { TimeSeriesTreeMarkerData } from '../types/tree'

export interface SuginamiTreeData {
  year: number
  treeId: string
  latitude: number
  longitude: number
  facilityType: string
  species: string
  notes: string
  location: string
}

export const loadSuginamiTreeData = async (): Promise<TimeSeriesTreeMarkerData[]> => {
  try {
    const response = await fetch('/data/suginami_opendata_2025.csv')
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const csvText = await response.text()
    const lines = csvText.split('\n').filter(line => line.trim() !== '')
    
    if (lines.length === 0) {
      throw new Error('CSVファイルが空です')
    }

    // Remove BOM if present and get headers
    const headers = lines[0].replace(/^\ufeff/, '').split(',')
    const expectedHeaders = ['年度', '樹木ID', '緯度', '経度', '施設区分', '種類', '備考', '所在地']
    
    console.log('CSV Headers:', headers)
    console.log('Expected Headers:', expectedHeaders)

    // Parse data rows
    const trees: TimeSeriesTreeMarkerData[] = []
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',')
      
      if (values.length !== headers.length) {
        console.warn(`行 ${i + 1}: カラム数が一致しません (期待値: ${headers.length}, 実際: ${values.length})`)
        continue
      }

      try {
        const year = parseInt(values[0])
        const treeId = values[1].trim()
        const latitude = parseFloat(values[2])
        const longitude = parseFloat(values[3])
        const facilityType = values[4].trim()
        const species = values[5].trim()
        const notes = values[6].trim()
        const location = values[7].trim()

        if (isNaN(year) || isNaN(latitude) || isNaN(longitude)) {
          console.warn(`行 ${i + 1}: 数値の解析に失敗しました`)
          continue
        }

        // Convert Suginami data to TimeSeriesTreeMarkerData format
        const tree: TimeSeriesTreeMarkerData = {
          id: `${treeId}-${year}`, // Create unique ID from treeId and year
          year,
          number: i, // Use row number as number since not provided
          treeId,
          species,
          location,
          circumference: 0, // Not provided in Suginami data
          height: 0, // Not provided in Suginami data
          condition: '健全', // Default condition since not provided
          notes: `${facilityType}${notes ? ` - ${notes}` : ''}`,
          latitude,
          longitude
        }

        trees.push(tree)
      } catch (error) {
        console.error(`行 ${i + 1} の解析エラー:`, error)
      }
    }

    console.log(`杉並区データを読み込みました: ${trees.length}件`)
    return trees
  } catch (error) {
    console.error('杉並区CSVファイルの読み込みエラー:', error)
    throw new Error(`杉並区データの読み込みに失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`)
  }
}