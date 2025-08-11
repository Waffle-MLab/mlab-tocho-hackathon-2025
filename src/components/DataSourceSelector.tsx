import { DataSource } from '../types/tree'
import './DataSourceSelector.css'

interface DataSourceSelectorProps {
  selectedSource: DataSource
  onSourceChange: (source: DataSource) => void
  loading: boolean
}

const DataSourceSelector = ({ selectedSource, onSourceChange, loading }: DataSourceSelectorProps) => {
  return (
    <div className="data-source-selector">
      <label htmlFor="data-source">データソース: </label>
      <select
        id="data-source"
        value={selectedSource}
        onChange={(e) => onSourceChange(e.target.value as DataSource)}
        disabled={loading}
      >
        <option value="tokyo">東京都街路樹データ</option>
        <option value="jindai">神代植物公園デモデータ</option>
        <option value="timeseries">神代植物公園時系列データ</option>
      </select>
    </div>
  )
}

export default DataSourceSelector