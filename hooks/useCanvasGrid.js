import { VideoQuality } from '@zoom/videosdk';
import { useTest } from '../contexts/TestProvider';
import { useRenderVideo } from './useRenderVideo';

const layoutCandidates = Array.from({ length: 18 })
  .map((value, index) => {
    const count = index + 1;
    const mid = Math.ceil(count / 2);
    const candidates = Array.from({ length: mid })
      .map((v, i) => {
        const row = i + 1;
        const column = Math.ceil(count / row);
        if (row < column) {
          return [
            {
              row,
              column,
            },
            {
              row: column,
              column: row,
            },
          ];
        }
        if (row === column) {
          return [
            {
              row,
              column,
            },
          ];
        }
        return [];
      })
      .reduce((prev, curr) => [...prev, ...curr], []);
    return { count, candidates };
  })
  .reduce((prev, curr) => ({ ...prev, [curr.count]: curr.candidates }), {});

const aspectRatio = 16 / 9;
const minCellWidth = 280;
const minCellHeight = minCellWidth / aspectRatio;
const cellOffset = 1;
const maxCount = 18;
const maxRowsColumns = (width, height) => ({
  maxColumns: Math.max(1, Math.floor(width / (minCellWidth + cellOffset * 2))),
  maxRows: Math.max(1, Math.floor(height / (minCellHeight + cellOffset * 2))),
});

const getVideoLayout = (rootWidth, rootHeight, count) => {
  /**
   * [1,count]
   */
  if (count > maxCount || count === 0) {
    return [];
  }
  let { maxRows, maxColumns } = maxRowsColumns(rootWidth, rootHeight);
  maxRows = Math.min(maxRows, count);
  maxColumns = Math.min(maxColumns, count);
  const actualCount = Math.min(count, maxRows * maxColumns);
  const layoutOfCount = layoutCandidates[actualCount].filter(
    (item) => item.row <= maxRows && item.column <= maxColumns
  );
  const preferredLayout = layoutOfCount
    .map((item) => {
      const { column, row } = item;
      const canonical = Math.floor(
        Math.min(rootWidth / (16 * column), rootHeight / (9 * row))
      );
      const cellWidth = canonical * 16 - cellOffset * 2;
      const cellHeight = canonical * 9 - cellOffset * 2;
      return {
        cellWidth,
        cellHeight,
        cellArea: cellWidth * cellHeight,
        column,
        row,
      };
    })
    .reduce(
      (prev, curr) => {
        if (curr.cellArea > prev.cellArea) {
          return curr;
        }
        return prev;
      },
      { cellArea: 0, cellHeight: 0, cellWidth: 0, column: 0, row: 0 }
    );
  const { cellWidth, cellHeight, column, row } = preferredLayout;
  const cellBoxWidth = cellWidth + cellOffset * 2;
  const cellBoxHeight = cellHeight + cellOffset * 2;
  const horizontalMargin = (rootWidth - cellBoxWidth * column) / 2 + cellOffset;
  const verticalMargin = (rootHeight - cellBoxHeight * row) / 2 + cellOffset;
  const cellDimensions = [];
  const lastRowColumns = column - ((column * row) % actualCount);
  const lastRowMargin =
    (rootWidth - cellBoxWidth * lastRowColumns) / 2 + cellOffset;
  let quality;

  if (actualCount < 5) {
    // GROUP HD
    quality = VideoQuality.Video_720P;
  } else if (actualCount < 9) {
    quality = VideoQuality.Video_360P;
  } else {
    quality = VideoQuality.Video_180P;
  }
  for (let i = 0; i < row; i++) {
    for (let j = 0; j < column; j++) {
      const leftMargin = i !== row - 1 ? horizontalMargin : lastRowMargin;
      if (i * column + j < actualCount) {
        cellDimensions.push({
          width: cellWidth,
          height: cellHeight,
          x: Math.floor(leftMargin + j * cellBoxWidth),
          y: Math.floor(verticalMargin + (row - i - 1) * cellBoxHeight),
          quality,
        });
      }
    }
  }
  return cellDimensions;
};

export const useCanvasGrid = (
  canvasRef,
  dimension,
  isVideoDecodeReady,
  participants
) => {
  const { provider } = useTest();
  const currentUser = provider.client.getCurrentUserInfo();

  const layout = getVideoLayout(
    dimension.width,
    dimension.height,
    participants.length
  );
  const subscribedVideos = participants.map((p) => p.userId);

  useRenderVideo(
    canvasRef,
    provider.client.getMediaStream(),
    isVideoDecodeReady,
    layout,
    subscribedVideos,
    participants,
    currentUser.userId
  );

  return layout;
};
