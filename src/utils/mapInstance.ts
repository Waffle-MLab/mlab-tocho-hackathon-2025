import L from 'leaflet'

// グローバルなマップ参照を作成
let globalMapInstance: L.Map | null = null

// Mapコンポーネントからマップインスタンスをセットするためのヘルパー
export const setGlobalMapInstance = (mapInstance: L.Map) => {
  globalMapInstance = mapInstance
}

export const getGlobalMapInstance = () => globalMapInstance