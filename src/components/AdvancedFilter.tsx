import { useState, useMemo } from 'react'
import { TimeSeriesTreeMarkerData } from '../types/tree'
import './AdvancedFilter.css'

interface FilterSettings {
  species: string[]
  conditions: string[]
}

interface AdvancedFilterProps {
  trees: TimeSeriesTreeMarkerData[]
  onFilterChange: (filteredTrees: TimeSeriesTreeMarkerData[]) => void
  showClusters?: boolean
  onToggleClusters?: (show: boolean) => void
  showOnlyProblematicTrees?: boolean
  onToggleProblematicFilter?: (show: boolean) => void
  clusterDistance?: number
  onDistanceChange?: (distance: number) => void
  overlapThreshold?: number
  onOverlapThresholdChange?: (threshold: number) => void
}

const AdvancedFilter = ({
  trees,
  onFilterChange,
  showClusters = true,
  onToggleClusters,
  showOnlyProblematicTrees = false,
  onToggleProblematicFilter,
  clusterDistance = 25,
  onDistanceChange,
  overlapThreshold = 0.3,
  onOverlapThresholdChange
}: AdvancedFilterProps) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [filterSettings, setFilterSettings] = useState<FilterSettings>({
    species: [],
    conditions: []
  })

  // Extract unique species and conditions from data
  const { uniqueSpecies, uniqueConditions } = useMemo(() => {
    const species = new Set<string>()
    const conditions = new Set<string>()

    trees.forEach(tree => {
      if (tree.species) species.add(tree.species)
      if (tree.condition) conditions.add(tree.condition)
    })

    return {
      uniqueSpecies: Array.from(species).sort(),
      uniqueConditions: Array.from(conditions).sort()
    }
  }, [trees])

  // Apply filters and notify parent
  const applyFilters = (settings: FilterSettings) => {
    let filtered = [...trees]

    // Species filter
    if (settings.species.length > 0) {
      filtered = filtered.filter(tree => settings.species.includes(tree.species || ''))
    }

    // Condition filter
    if (settings.conditions.length > 0) {
      filtered = filtered.filter(tree => settings.conditions.includes(tree.condition))
    }



    onFilterChange(filtered)
  }

  const handleSpeciesChange = (species: string, checked: boolean) => {
    const newSpecies = checked
      ? [...filterSettings.species, species]
      : filterSettings.species.filter(s => s !== species)

    const newSettings = { ...filterSettings, species: newSpecies }
    setFilterSettings(newSettings)
    applyFilters(newSettings)
  }

  const handleConditionChange = (condition: string, checked: boolean) => {
    const newConditions = checked
      ? [...filterSettings.conditions, condition]
      : filterSettings.conditions.filter(c => c !== condition)

    const newSettings = { ...filterSettings, conditions: newConditions }
    setFilterSettings(newSettings)
    applyFilters(newSettings)
  }

  const resetFilters = () => {
    const defaultSettings = {
      species: [],
      conditions: []
    }
    setFilterSettings(defaultSettings)
    applyFilters(defaultSettings)
  }

  const getActiveFilterCount = () => {
    return filterSettings.species.length +
      filterSettings.conditions.length
  }

  return (
    <div className={`advanced-filter ${isExpanded ? 'expanded' : ''}`}>
      <div className="filter-header" onClick={() => setIsExpanded(!isExpanded)}>
        <span className="filter-title">詳細フィルター</span>
        {getActiveFilterCount() > 0 && (
          <span className="filter-count">{getActiveFilterCount()}</span>
        )}
        <span className="filter-toggle">{isExpanded ? '−' : '+'}</span>
      </div>

      {isExpanded && (
        <div className="filter-content">
          <div className="filter-actions">
            <button className="reset-button" onClick={resetFilters}>
              リセット
            </button>
          </div>

          <div className="filter-section">
            <h4>樹種</h4>
            <div className="checkbox-grid">
              {uniqueSpecies.map(species => (
                <label key={species} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={filterSettings.species.includes(species)}
                    onChange={(e) => handleSpeciesChange(species, e.target.checked)}
                  />
                  <span>{species}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <h4>状態</h4>
            <div className="checkbox-grid">
              {uniqueConditions.map(condition => (
                <label key={condition} className={`checkbox-item condition-${condition}`}>
                  <input
                    type="checkbox"
                    checked={filterSettings.conditions.includes(condition)}
                    onChange={(e) => handleConditionChange(condition, e.target.checked)}
                  />
                  <span>{condition}</span>
                </label>
              ))}
            </div>
          </div>


          <div className="filter-section">
            <h4>表示設定</h4>
            <div className="display-controls">
              {onToggleClusters && (
                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={showClusters}
                    onChange={(e) => onToggleClusters(e.target.checked)}
                  />
                  <span>クラスター表示</span>
                </label>
              )}
              {onToggleProblematicFilter && (
                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={showOnlyProblematicTrees}
                    onChange={(e) => onToggleProblematicFilter(e.target.checked)}
                  />
                  <span>問題のある樹木のみ表示</span>
                </label>
              )}
            </div>
          </div>

          <div className="filter-section">
            <h4>円形クラスター範囲</h4>
            <div className="distance-controls">
              {onDistanceChange && (
                <div className="distance-control">
                  <label>クラスター半径: {clusterDistance}m</label>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    value={clusterDistance}
                    onChange={(e) => onDistanceChange(Number(e.target.value))}
                    className="range-input"
                  />
                </div>
              )}
              {onOverlapThresholdChange && (
                <div className="distance-control">
                  <label>結合閾値: {Math.round((overlapThreshold || 0.3) * 100)}%</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={Math.round((overlapThreshold || 0.3) * 100)}
                    onChange={(e) => onOverlapThresholdChange(Number(e.target.value) / 100)}
                    className="range-input"
                  />
                </div>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  )
}

export default AdvancedFilter