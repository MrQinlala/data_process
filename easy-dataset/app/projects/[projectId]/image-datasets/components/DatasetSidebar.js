'use client';

import { Box } from '@mui/material';
import MetadataInfo from './MetadataInfo';
import MetadataEditor from './MetadataEditor';

/**
 * 数据集右侧边栏组件
 */
export default function DatasetSidebar({ dataset, projectId, onUpdate }) {
  return (
    <Box
      sx={{
        width: 360,
        position: 'sticky',
        top: 24,
        maxHeight: 'calc(100vh - 48px)',
        overflowY: 'auto'
      }}
    >
      {/* 元数据信息 - Chip 形式 */}
      <MetadataInfo dataset={dataset} />

      {/* 操作卡片 */}
      <MetadataEditor dataset={dataset} projectId={projectId} onUpdate={onUpdate} />
    </Box>
  );
}
