import { loadTreeData } from '../utils/csvLoader';
import { TimeSeriesTreeMarkerData } from '../types/tree';

/**
 * Fetches all tree data and processes it to get the latest entry for each unique tree.
 * This simulates fetching from a database where we only get the current state of each tree.
 * @returns A promise that resolves to an array of the latest tree data.
 */
export const getExistingTrees = async (): Promise<TimeSeriesTreeMarkerData[]> => {
  const allTimeSeriesData = await loadTreeData();

  const latestTreesMap = new Map<string, TimeSeriesTreeMarkerData>();

  allTimeSeriesData.forEach(tree => {
    const existingTree = latestTreesMap.get(tree.treeId);
    if (!existingTree || tree.year > existingTree.year) {
      latestTreesMap.set(tree.treeId, tree);
    }
  });

  return Array.from(latestTreesMap.values());
};
