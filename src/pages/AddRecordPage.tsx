
import { useState, useEffect, useMemo } from 'react';
import L from 'leaflet';
import { Marker, Popup } from 'react-leaflet';

import Header from '../components/Header';
import Map from '../components/Map';
import AddRecordForm from '../components/AddRecordForm';
import StagedRecordsList, { StagedRecord } from '../components/StagedRecordsList';
import { TimeSeriesTreeMarkerData } from '../types/tree';
import { getExistingTrees } from '../repositories/treeRepository';

import '../App.css';
import './AddRecordPage.css';

const treeIcon = new L.DivIcon({
  html: `<svg viewBox="0 0 24 24" width="24" height="24" fill="#28a745" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`,
  className: 'custom-div-icon',
  iconSize: [24, 24],
  iconAnchor: [12, 24],
});

const selectedTreeIcon = new L.DivIcon({
  html: `<svg viewBox="0 0 24 24" width="30" height="30" fill="#ff9800" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`,
  className: 'custom-div-icon',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

const stagedRecordTreeIcon = new L.DivIcon({
  html: `<svg viewBox="0 0 24 24" width="24" height="24" fill="#007bff" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`,
  className: 'custom-div-icon',
  iconSize: [24, 24],
  iconAnchor: [12, 24],
});

function AddRecordPage() {
  const [trees, setTrees] = useState<TimeSeriesTreeMarkerData[]>([]);
  const [selectedTree, setSelectedTree] = useState<TimeSeriesTreeMarkerData | null>(null);
  const [stagedRecords, setStagedRecords] = useState<StagedRecord[]>([]);
  const [editingRecord, setEditingRecord] = useState<StagedRecord | null>(null);

  const treeIdsWithStagedRecords = useMemo(() => {
    return new Set(stagedRecords.map(r => r.treeId));
  }, [stagedRecords]);

  useEffect(() => {
    const fetchTrees = async () => {
      try {
        const existingTrees = await getExistingTrees();
        setTrees(existingTrees);
      } catch (error) {
        console.error("Failed to fetch existing trees:", error);
        alert('既存の樹木データの読み込みに失敗しました。');
      }
    };
    fetchTrees();
  }, []);

  const mapConfig = {
    center: [35.6718, 139.5503] as [number, number],
    zoom: 16,
  };

  const handleTreeClick = (tree: TimeSeriesTreeMarkerData) => {
    setSelectedTree(tree);
    setEditingRecord(null); // Clear any active editing when a new tree is selected
  };

  const handleSaveRecord = (recordText: string) => {
    if (editingRecord) {
      // Update existing record
      const updatedRecord = { ...editingRecord, record: recordText };
      setStagedRecords(stagedRecords.map(r => r.tempId === editingRecord.tempId ? updatedRecord : r));
      setEditingRecord(null);
    } else {
      // Add new record
      if (!selectedTree) return;
      const newRecord: StagedRecord = {
        tempId: Date.now(),
        treeId: selectedTree.treeId,
        treeName: selectedTree.name,
        record: recordText,
      };
      setStagedRecords([...stagedRecords, newRecord]);
    }
  };

  const handleEditRecord = (record: StagedRecord) => {
    setEditingRecord(record);
    // Find and set the associated tree as selected to maintain context
    const associatedTree = trees.find(t => t.treeId === record.treeId);
    if (associatedTree) {
      setSelectedTree(associatedTree);
    }
  };

  const handleDeleteRecord = (tempId: number) => {
    setStagedRecords(stagedRecords.filter(r => r.tempId !== tempId));
    if (editingRecord && editingRecord.tempId === tempId) {
      setEditingRecord(null);
    }
  };

  const clearEditing = () => {
    setEditingRecord(null);
  }

  const handleFinalSubmit = () => {
    if (stagedRecords.length === 0) {
      alert('登録する記録がありません。');
      return;
    }
    alert(`${stagedRecords.length}件の記録が登録されました（仮）`);
    // Here you would typically send the data to a server
    setStagedRecords([]);
    setEditingRecord(null);
  };

  const getMarkerIcon = (tree: TimeSeriesTreeMarkerData) => {
    if (selectedTree?.treeId === tree.treeId) {
      return selectedTreeIcon;
    }
    if (treeIdsWithStagedRecords.has(tree.treeId)) {
      return stagedRecordTreeIcon;
    }
    return treeIcon;
  };

  return (
    <div className="App">
      <Header title="調査・治療記録の追加" />
      <main className="App-main add-record-page-main">
        <Map
          className="map-container"
          center={mapConfig.center}
          zoom={mapConfig.zoom}
        >
          {trees.map(tree => (
            <Marker
              key={tree.treeId}
              position={[tree.latitude, tree.longitude]}
              icon={getMarkerIcon(tree)}
              eventHandlers={{
                click: () => handleTreeClick(tree),
              }}
            >
              <Popup>
                樹木ID: {tree.treeId}<br />
                {tree.name || '名前なし'}
              </Popup>
            </Marker>
          ))}
        </Map>
        <div className="sidebar">
          <AddRecordForm 
            selectedTree={selectedTree} 
            editingRecord={editingRecord}
            onSaveRecord={handleSaveRecord}
            clearEditing={clearEditing}
          />
          <StagedRecordsList 
            stagedRecords={stagedRecords} 
            onDelete={handleDeleteRecord}
            onEdit={handleEditRecord}
          />
          {stagedRecords.length > 0 && (
            <div className="finalize-section">
              <button onClick={handleFinalSubmit} className="finalize-button">
                全{stagedRecords.length}件を確定する
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default AddRecordPage;
