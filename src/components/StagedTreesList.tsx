import React from 'react';
import { TimeSeriesTreeMarkerData } from '../types/tree';
import './StagedTreesList.css';

type StagedTree = Partial<TimeSeriesTreeMarkerData> & { tempId: number };

interface StagedTreesListProps {
  stagedTrees: StagedTree[];
  onEdit: (tree: StagedTree) => void;
  onDelete: (tempId: number) => void;
}

const StagedTreesList: React.FC<StagedTreesListProps> = ({ stagedTrees, onEdit, onDelete }) => {
  return (
    <div className="staged-trees-list-container">
      <h3>登録待ちリスト</h3>
      {stagedTrees.length === 0 ? (
        <p className="empty-list-message">まだ樹木が追加されていません。</p>
      ) : (
        <ul className="staged-trees-list">
          {stagedTrees.map((tree, index) => (
            <li key={tree.tempId} className="staged-tree-item">
              <div className="tree-info">
                <span className="tree-id">樹木 {index + 1}</span>
                <span className="tree-coords">緯度: {tree.latitude?.toFixed(4)}, 経度: {tree.longitude?.toFixed(4)}</span>
              </div>
              <div className="tree-actions">
                <button onClick={() => onEdit(tree)} className="edit-button">編集</button>
                <button onClick={() => onDelete(tree.tempId!)} className="delete-button">削除</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default StagedTreesList;
