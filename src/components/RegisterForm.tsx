
import React, { useState, useEffect } from 'react';
import L from 'leaflet';
import './RegisterForm.css';
import { TimeSeriesTreeMarkerData } from '../types/tree';

interface RegisterFormProps {
  coordinates: L.LatLng | null;
  onSave: (tree: Partial<TimeSeriesTreeMarkerData>) => void;
  editingTree: Partial<TimeSeriesTreeMarkerData> | null;
  clearEditing: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ coordinates, onSave, editingTree, clearEditing }) => {
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (editingTree) {
      setIsEditing(true);
      setLat(editingTree.latitude?.toString() || '');
      setLng(editingTree.longitude?.toString() || '');
    } else {
      setIsEditing(false);
      if (coordinates) {
        setLat(coordinates.lat.toFixed(6));
        setLng(coordinates.lng.toFixed(6));
      } else {
        setLat('');
        setLng('');
      }
    }
  }, [editingTree, coordinates]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lat || !lng) {
      alert('緯度経度が指定されていません。地図をクリックしてください。');
      return;
    }
    onSave({
      ...editingTree,
      latitude: parseFloat(lat),
      longitude: parseFloat(lng),
    });
  };
  
  const handleCancel = () => {
    clearEditing();
  }

  return (
    <div className="register-form-container">
      <h2>{isEditing ? '樹木情報の編集' : '樹木の追加'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="latitude">緯度</label>
          <input
            type="text"
            id="latitude"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            readOnly
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="longitude">経度</label>
          <input
            type="text"
            id="longitude"
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            readOnly
            required
          />
        </div>
        <p className="map-instruction">
          {isEditing ? '情報を編集して更新ボタンを押してください。' : '地図をクリックして緯度経度を指定してください。'}
        </p>
        <div className="form-buttons">
          <button type="submit" className="submit-button">
            {isEditing ? '更新' : 'リストに追加'}
          </button>
          {isEditing && (
            <button type="button" onClick={handleCancel} className="cancel-button">
              キャンセル
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;
