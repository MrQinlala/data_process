'use client';

import { Box, Paper, IconButton, InputBase, Button, Badge } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import { useTranslation } from 'react-i18next';

export default function ImageDatasetFilters({
  searchQuery,
  onSearchChange,
  onMoreFiltersClick,
  activeFilterCount = 0
}) {
  const { t } = useTranslation();

  return (
    <Box sx={{ display: 'flex', gap: 2 }}>
      {/* 搜索框 - 完全参考数据集管理的设计 */}
      <Paper
        component="form"
        sx={{
          p: '2px 4px',
          display: 'flex',
          alignItems: 'center',
          width: 400,
          borderRadius: 2
        }}
      >
        <IconButton sx={{ p: '10px' }} aria-label="search">
          <SearchIcon />
        </IconButton>
        <InputBase
          sx={{ ml: 1, flex: 1 }}
          placeholder={t('imageDatasets.searchPlaceholder', { defaultValue: '搜索问题或答案...' })}
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
        />
      </Paper>

      {/* 更多筛选按钮 - 带 Badge 显示活跃筛选条件数 */}
      <Badge badgeContent={activeFilterCount} color="error" overlap="circular">
        <Button variant="outlined" onClick={onMoreFiltersClick} startIcon={<FilterListIcon />} sx={{ borderRadius: 2 }}>
          {t('datasets.moreFilters', '更多筛选')}
        </Button>
      </Badge>
    </Box>
  );
}
