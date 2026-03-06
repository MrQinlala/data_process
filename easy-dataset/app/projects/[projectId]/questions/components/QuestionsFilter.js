'use client';

import { Box, Stack, Checkbox, Typography, TextField, InputAdornment, Select, MenuItem, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import SearchIcon from '@mui/icons-material/Search';

export default function QuestionsFilter({
  // 选择相关
  selectedQuestionsCount,
  totalQuestions,
  isAllSelected,
  isIndeterminate,
  onSelectAll,

  // 搜索相关
  searchTerm,
  onSearchChange,
  searchMatchMode,
  onSearchMatchModeChange,

  // 过滤相关
  answerFilter,
  onFilterChange,

  // 文本块名称筛选
  chunkNameFilter,
  onChunkNameFilterChange,

  // 数据源类型筛选
  sourceTypeFilter,
  onSourceTypeFilterChange,

  activeTab
}) {
  const { t } = useTranslation();
  const theme = useTheme();

  if (activeTab === 1) {
    return <></>;
  }
  return (
    <Box sx={{ p: 2 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        alignItems={{ xs: 'stretch', sm: 'center' }}
        justifyContent="space-between"
      >
        {/* 选择区域 */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Checkbox checked={isAllSelected} indeterminate={isIndeterminate} onChange={onSelectAll} />
          <Typography variant="body2" sx={{ ml: 1 }}>
            {selectedQuestionsCount > 0
              ? t('questions.selectedCount', { count: selectedQuestionsCount })
              : t('questions.selectAll')}
            (
            {t('questions.totalCount', {
              count: totalQuestions
            })}
            )
          </Typography>
        </Box>

        {/* 搜索和过滤区域 */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          {/* 组合搜索框：下拉选择（匹配/不匹配）+ 输入框 */}
          <Box sx={{ display: 'flex', alignItems: 'center', width: { xs: '100%', sm: 300 } }}>
            <Select
              value={searchMatchMode}
              onChange={onSearchMatchModeChange}
              size="small"
              sx={{
                width: 110,
                borderTopRightRadius: 0,
                borderBottomRightRadius: 0,
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'white',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderRight: 'none',
                  borderColor: theme.palette.mode === 'dark' ? 'transparent' : 'rgba(0, 0, 0, 0.23)'
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.palette.mode === 'dark' ? 'transparent' : 'rgba(0, 0, 0, 0.87)'
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'primary.main'
                }
              }}
            >
              <MenuItem value="match">{t('questions.searchMatch')}</MenuItem>
              <MenuItem value="notMatch">{t('questions.searchNotMatch')}</MenuItem>
            </Select>
            <TextField
              placeholder={t('questions.searchPlaceholder')}
              variant="outlined"
              size="small"
              fullWidth
              value={searchTerm}
              onChange={onSearchChange}
              sx={{
                flex: 1,
                '& .MuiOutlinedInput-root': {
                  borderTopLeftRadius: 0,
                  borderBottomLeftRadius: 0
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" color="action" />
                  </InputAdornment>
                )
              }}
            />
          </Box>
          <TextField
            placeholder={t('questions.filterChunkNamePlaceholder')}
            variant="outlined"
            size="small"
            sx={{ width: { xs: '100%', sm: 200 } }}
            value={chunkNameFilter}
            onChange={onChunkNameFilterChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              )
            }}
          />
          <Select
            value={sourceTypeFilter}
            onChange={onSourceTypeFilterChange}
            size="small"
            sx={{
              width: { xs: '100%', sm: 150 },
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'white',
              borderRadius: '8px',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: theme.palette.mode === 'dark' ? 'transparent' : 'rgba(0, 0, 0, 0.23)'
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: theme.palette.mode === 'dark' ? 'transparent' : 'rgba(0, 0, 0, 0.87)'
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: 'primary.main'
              }
            }}
            MenuProps={{
              PaperProps: {
                elevation: 2,
                sx: { mt: 1, borderRadius: 2 }
              }
            }}
          >
            <MenuItem value="all">{t('questions.sourceTypeAll')}</MenuItem>
            <MenuItem value="text">{t('questions.sourceTypeText')}</MenuItem>
            <MenuItem value="image">{t('questions.sourceTypeImage')}</MenuItem>
          </Select>
          <Select
            value={answerFilter}
            onChange={onFilterChange}
            size="small"
            sx={{
              width: { xs: '100%', sm: 150 },
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'white',
              borderRadius: '8px',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: theme.palette.mode === 'dark' ? 'transparent' : 'rgba(0, 0, 0, 0.23)'
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: theme.palette.mode === 'dark' ? 'transparent' : 'rgba(0, 0, 0, 0.87)'
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: 'primary.main'
              }
            }}
            MenuProps={{
              PaperProps: {
                elevation: 2,
                sx: { mt: 1, borderRadius: 2 }
              }
            }}
          >
            <MenuItem value="all">{t('questions.filterAll')}</MenuItem>
            <MenuItem value="answered">{t('questions.filterAnswered')}</MenuItem>
            <MenuItem value="unanswered">{t('questions.filterUnanswered')}</MenuItem>
          </Select>
        </Box>
      </Stack>
    </Box>
  );
}
