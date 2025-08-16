
import React, { useMemo } from 'react';
import './StagedRecordsList.css';

export type StagedRecord = {
  tempId: number;
  treeId: string;
  treeSpecies?: string;
  record: string;
};

interface StagedRecordsListProps {
  stagedRecords: StagedRecord[];
  onDelete: (tempId: number) => void;
  onEdit: (record: StagedRecord) => void;
}

const StagedRecordsList: React.FC<StagedRecordsListProps> = ({ stagedRecords, onDelete, onEdit }) => {

  const groupedRecords = useMemo(() => {
    return stagedRecords.reduce((acc, record) => {
      (acc[record.treeId] = acc[record.treeId] || []).push(record);
      return acc;
    }, {} as Record<string, StagedRecord[]>);
  }, [stagedRecords]);

  const treeIds = Object.keys(groupedRecords);

  return (
    <div className="staged-records-list-container">
      <h4>記録待ちリスト</h4>
      {stagedRecords.length === 0 ? (
        <p className="empty-list-message">まだ記録が追加されていません。</p>
      ) : (
        <div className="grouped-records-container">
          {treeIds.map(treeId => {
            const records = groupedRecords[treeId];
            const treeSpecies = records[0].treeSpecies || '名前なし';
            return (
              <div key={treeId} className="tree-group">
                <h5 className="tree-group-header">樹木ID: {treeId} ({treeSpecies})</h5>
                <ul className="staged-records-list">
                  {records.map((r) => (
                    <li key={r.tempId} className="staged-record-item">
                      <div className="record-info">
                        <p className="record-content">{r.record}</p>
                      </div>
                      <div className="record-actions">
                        <button onClick={() => onEdit(r)} className="edit-button">編集</button>
                        <button onClick={() => onDelete(r.tempId)} className="delete-button">削除</button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StagedRecordsList;
