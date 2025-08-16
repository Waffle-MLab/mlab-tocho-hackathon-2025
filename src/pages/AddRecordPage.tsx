
import { useState, useEffect } from 'react';
import L from 'leaflet';
import { Marker, Popup } from 'react-leaflet';

import Header from '../components/Header';
import Map from '../components/Map';
import AddRecordForm from '../components/AddRecordForm';
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


function AddRecordPage() {
  const [trees, setTrees] = useState<TimeSeriesTreeMarkerData[]>([]);
  const [selectedTree, setSelectedTree] = useState<TimeSeriesTreeMarkerData | null>(null);

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
              icon={selectedTree?.treeId === tree.treeId ? selectedTreeIcon : treeIcon}
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
          <AddRecordForm selectedTree={selectedTree} />
        </div>
      </main>
    </div>
  );
}

export default AddRecordPage;
