import { useState, useMemo } from 'react'
import { TimeSeriesTreeMarkerData } from '../types/tree'
import './AdvancedFilter.css'

interface FilterSettings {
  species: string[]
  conditions: string[]
  yearRange: [number, number]
  showHealthyOnly: boolean
  showProblematicOnly: boolean
}

interface AdvancedFilterProps {
  trees: TimeSeriesTreeMarkerData[]
  availableYears: number[]
  onFilterChange: (filteredTrees: TimeSeriesTreeMarkerData[]) => void
  showClusters?: boolean
  onToggleClusters?: (show: boolean) => void
  showOnlyProblematicTrees?: boolean
  onToggleProblematicFilter?: (show: boolean) => void
}

const AdvancedFilter = ({
  trees,
  availableYears,
  onFilterChange,
  showClusters = true,
  onToggleClusters,
  showOnlyProblematicTrees = false,
  onToggleProblematicFilter
}: AdvancedFilterProps) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [filterSettings, setFilterSettings] = useState<FilterSettings>({
    species: [],
    conditions: [],
    yearRange: [Math.min(...availableYears), Math.max(...availableYears)],
    showHealthyOnly: false,
    showProblematicOnly: false
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

    // Year range filter
    filtered = filtered.filter(tree =>
      tree.year >= settings.yearRange[0] && tree.year <= settings.yearRange[1]
    )

    // Healthy/Problematic filter
    if (settings.showHealthyOnly) {
      filtered = filtered.filter(tree => tree.condition === '健全')
    } else if (settings.showProblematicOnly) {
      filtered = filtered.filter(tree =>
        tree.condition === '枯死' ||
        tree.condition === '立ち枯れ' ||
        tree.condition === '虫害'
      )
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
      conditions: [],
      yearRange: [Math.min(...availableYears), Math.max(...availableYears)] as [number, number],
      showHealthyOnly: false,
      showProblematicOnly: false
    }
    setFilterSettings(defaultSettings)
    applyFilters(defaultSettings)
  }

  const getActiveFilterCount = () => {
    return filterSettings.species.length +
      filterSettings.conditions.length +
      (filterSettings.showHealthyOnly ? 1 : 0) +
      (filterSettings.showProblematicOnly ? 1 : 0)
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
            <h4>年代範囲</h4>
            <div className="range-slider">
              <input
                type="range"
                min={Math.min(...availableYears)}
                max={Math.max(...availableYears)}
                value={filterSettings.yearRange[0]}
                onChange={(e) => {
                  const newStart = Number(e.target.value)
                  const newRange: [number, number] = [newStart, Math.max(newStart, filterSettings.yearRange[1])]
                  const newSettings = { ...filterSettings, yearRange: newRange }
                  setFilterSettings(newSettings)
                  applyFilters(newSettings)
                }}
                className="range-input"
              />
              <input
                type="range"
                min={Math.min(...availableYears)}
                max={Math.max(...availableYears)}
                value={filterSettings.yearRange[1]}
                onChange={(e) => {
                  const newEnd = Number(e.target.value)
                  const newRange: [number, number] = [Math.min(filterSettings.yearRange[0], newEnd), newEnd]
                  const newSettings = { ...filterSettings, yearRange: newRange }
                  setFilterSettings(newSettings)
                  applyFilters(newSettings)
                }}
                className="range-input"
              />
              <div className="range-labels">
                <span>{filterSettings.yearRange[0]}年</span>
                <span>{filterSettings.yearRange[1]}年</span>
              </div>
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
            <h4>クイックフィルター</h4>
            <div className="quick-filters">
              <label className="checkbox-item">
                <input
                  type="checkbox"
                  checked={filterSettings.showHealthyOnly}
                  onChange={(e) => {
                    const newSettings = {
                      ...filterSettings,
                      showHealthyOnly: e.target.checked,
                      showProblematicOnly: e.target.checked ? false : filterSettings.showProblematicOnly
                    }
                    setFilterSettings(newSettings)
                    applyFilters(newSettings)
                  }}
                />
                <span className="healthy">健全な樹木のみ</span>
              </label>
              <label className="checkbox-item">
                <input
                  type="checkbox"
                  checked={filterSettings.showProblematicOnly}
                  onChange={(e) => {
                    const newSettings = {
                      ...filterSettings,
                      showProblematicOnly: e.target.checked,
                      showHealthyOnly: e.target.checked ? false : filterSettings.showHealthyOnly
                    }
                    setFilterSettings(newSettings)
                    applyFilters(newSettings)
                  }}
                />
                <span className="problematic">問題のある樹木のみ</span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdvancedFilter