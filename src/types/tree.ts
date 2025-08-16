// 時系列樹木データ（メインデータ型）
export interface TimeSeriesTreeMarkerData {
  id: string // マーカー識別用ID
  year: number // 年度
  number: number // 番号
  treeId: string // 樹木ID
  species: string // 樹種名
  location: string // 立地
  circumference: number // 木の周囲(cm)
  height: number // 樹高(m)
  condition: string // 状態
  notes: string // 備考
  latitude: number // 緯度
  longitude: number // 経度
}