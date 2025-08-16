
import React, { useState } from 'react';
import { TimeSeriesTreeMarkerData } from '../types/tree';
import './AddRecordForm.css';

interface AddRecordFormProps {
  selectedTree: TimeSeriesTreeMarkerData | null;
}

const AddRecordForm: React.FC<AddRecordFormProps> = ({ selectedTree }) => {
  const [record, setRecord] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTree) {
      alert('樹木が選択されていません。');
      return;
    }
    if (!record.trim()) {
      alert('記録内容を入力してください。');
      return;
    }
    alert(`樹木ID: ${selectedTree.treeId}\n記録内容: ${record}`);
    setRecord('');
  };

  if (!selectedTree) {
    return (
      <div className="add-record-form-container">
        <p>地図上の樹木をクリックして、記録を開始します。</p>
      </div>
    );
  }

  return (
    <div className="add-record-form-container">
      <h3>記録の追加</h3>
      <div className="selected-tree-info">
        <p><strong>樹木ID:</strong> {selectedTree.treeId}</p>
        <p><strong>樹木名:</strong> {selectedTree.name || 'N/A'}</p>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="record">調査・治療記録</label>
          <textarea
            id="record"
            value={record}
            onChange={(e) => setRecord(e.target.value)}
            rows={5}
            placeholder="調査日、内容、治療の有無などを記録します。"
          />
        </div>
        <button type="submit" className="submit-button">この内容で記録する</button>
      </form>
    </div>
  );
};

export default AddRecordForm;

