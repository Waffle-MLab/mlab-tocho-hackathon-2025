export interface TreeData {
  species: string // 樹種名
  health: string // 健康度
  height: number // 樹高(m)
  circumference: number // 幹周(m)
  diameter: number // 胸高直径(cm)
  district: string // 区画名
  address: string // 住所
  managementNumber: number // 管理番号
  administrativeArea: string // 行政区画
  townName: string // 町名
  longitude: number // 経度
  latitude: number // 緯度
}

export interface JindaiTreeData {
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

export interface TimeSeriesTreeData {
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

export interface TreeMarkerData extends TreeData {
  id: string // マーカー識別用ID
}

export interface JindaiTreeMarkerData extends JindaiTreeData {
  id: string // マーカー識別用ID
}

export interface TimeSeriesTreeMarkerData extends TimeSeriesTreeData {
  id: string // マーカー識別用ID
}

export type DataSource = 'tokyo' | 'jindai' | 'timeseries'