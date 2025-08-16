
import React, { useState, useEffect } from 'react';
import { TimeSeriesTreeMarkerData } from '../types/tree';
import { StagedRecord } from './StagedRecordsList';
import './AddRecordForm.css';

interface AddRecordFormProps {
  selectedTree: TimeSeriesTreeMarkerData | null;
  editingRecord: StagedRecord | null;
  onSaveRecord: (recordText: string) => void;
  clearEditing: () => void;
}

const AddRecordForm: React.FC<AddRecordFormProps> = ({ selectedTree, editingRecord, onSaveRecord, clearEditing }) => {
  const [record, setRecord] = useState('');

  useEffect(() => {
    if (editingRecord) {
      setRecord(editingRecord.record);
    } else {
      setRecord('');
    }
  }, [editingRecord]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord && !selectedTree) {
      alert('樹木が選択されていません。');
      return;
    }
    if (!record.trim()) {
      alert('記録内容を入力してください。');
      return;
    }
    onSaveRecord(record);
    setRecord(''); // Clear form after saving
  };

  const handleCancelEdit = () => {
    clearEditing();
  }

  const currentTree = editingRecord ? { treeId: editingRecord.treeId, name: editingRecord.treeName } : selectedTree;

  if (!currentTree) {
    return (
      <div className="add-record-form-container">
        <p>地図上の樹木をクリックして、記録を開始します。</p>
      </div>
    );
  }

  return (
    <div className="add-record-form-container">
      <h3>{editingRecord ? '記録の編集' : '記録の追加'}</h3>
      <div className="selected-tree-info">
        <p><strong>樹木ID:</strong> {currentTree.treeId}</p>
        <p><strong>樹木名:</strong> {currentTree.name || 'N/A'}</p>
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
        <div className="form-actions">
          <button type="submit" className="submit-button">
            {editingRecord ? '記録を更新' : '記録を追加'}
          </button>
          {editingRecord && (
            <button type="button" onClick={handleCancelEdit} className="cancel-button">
              キャンセル
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default AddRecordForm;

