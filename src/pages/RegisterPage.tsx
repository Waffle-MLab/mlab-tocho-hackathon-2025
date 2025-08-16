
import { useState, useCallback } from 'react';
import L from 'leaflet';
import { Marker } from 'react-leaflet';

import Map from '../components/Map';
import RegisterForm from '../components/RegisterForm';
import StagedTreesList from '../components/StagedTreesList';
import { TimeSeriesTreeMarkerData } from '../types/tree';

import '../App.css';
import '../components/Map.css';
import './RegisterPage.css';

// Define a type for the staged tree, including the temporary ID
type StagedTree = Partial<TimeSeriesTreeMarkerData> & { tempId: number };

// Custom icon for staged trees (green)
const stagedTreeIcon = new L.DivIcon({
  html: `<svg viewBox="0 0 24 24" width="30" height="30" fill="#28a745" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`,
  className: 'custom-div-icon',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

// Custom icon for the currently selected/editing coordinate (orange)
const selectedCoordIcon = new L.DivIcon({
  html: `<svg viewBox="0 0 24 24" width="30" height="30" fill="#ff9800" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`,
  className: 'custom-div-icon',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

function RegisterPage() {
  const [stagedTrees, setStagedTrees] = useState<StagedTree[]>([]);
  const [coordinates, setCoordinates] = useState<L.LatLng | null>(null);
  const [editingTree, setEditingTree] = useState<StagedTree | null>(null);

  const mapConfig = {
    center: [35.6718, 139.5503] as [number, number],
    zoom: 16,
  };

  const handleMapClick = useCallback((e: L.LeafletMouseEvent) => {
    if (editingTree) {
      // If editing, update the coordinates of the tree being edited
      const updatedTree = { ...editingTree, latitude: e.latlng.lat, longitude: e.latlng.lng };
      setStagedTrees(stagedTrees.map(t => t.tempId === editingTree.tempId ? updatedTree : t));
      setEditingTree(updatedTree);
    } else {
      // If not editing, set coordinates for a new tree
      setCoordinates(e.latlng);
    }
  }, [editingTree, stagedTrees]);

  const handleSaveTree = (tree: Partial<TimeSeriesTreeMarkerData>) => {
    if (editingTree) {
      // Update existing tree details (form fields other than lat/lng)
      setStagedTrees(stagedTrees.map(t => t.tempId === editingTree.tempId ? { ...editingTree, ...tree } : t));
    } else {
      // Add new tree with a temporary ID
      const newTree: StagedTree = {
        ...tree,
        latitude: coordinates!.lat,
        longitude: coordinates!.lng,
        tempId: Date.now(),
      };
      setStagedTrees([...stagedTrees, newTree]);
    }
    setEditingTree(null);
    setCoordinates(null);
  };

  const handleEditTree = (tree: StagedTree) => {
    setEditingTree(tree);
    setCoordinates(null); // Clear new-point-coordinates when starting to edit
  };

  const handleDeleteTree = (tempId: number) => {
    setStagedTrees(stagedTrees.filter(t => t.tempId !== tempId));
    if (editingTree && editingTree.tempId === tempId) {
      setEditingTree(null);
      setCoordinates(null);
    }
  };

  const clearEditing = () => {
    setEditingTree(null);
    setCoordinates(null);
  }
  
  const handleFinalSubmit = () => {
    if (stagedTrees.length === 0) {
      alert('登録する樹木がありません。');
      return;
    }
    alert(`${stagedTrees.length}本の樹木データが登録されました（仮）`);
    // Here you would typically send the data to a server
    setStagedTrees([]);
  }

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-content">
          <h1>樹木データの登録</h1>
        </div>
      </header>
      <main className="App-main register-page-main">
        <Map
          className="map-container"
          center={mapConfig.center}
          zoom={mapConfig.zoom}
          onMapClick={handleMapClick}
        >
          {stagedTrees.map(tree => (
            <Marker 
              key={tree.tempId} 
              position={[tree.latitude!, tree.longitude!]} 
              icon={editingTree?.tempId === tree.tempId ? selectedCoordIcon : stagedTreeIcon} 
            />
          ))}
          {coordinates && !editingTree && <Marker position={coordinates} icon={selectedCoordIcon} />}
        </Map>
        <div className="sidebar">
          <RegisterForm 
            coordinates={editingTree ? new L.LatLng(editingTree.latitude!, editingTree.longitude!) : coordinates} 
            onSave={handleSaveTree}
            editingTree={editingTree}
            clearEditing={clearEditing}
          />
          <StagedTreesList 
            stagedTrees={stagedTrees}
            onEdit={handleEditTree}
            onDelete={handleDeleteTree}
          />
          <div className="finalize-section">
            <button onClick={handleFinalSubmit} className="finalize-button">
              全{stagedTrees.length}件を確定する
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default RegisterPage;
