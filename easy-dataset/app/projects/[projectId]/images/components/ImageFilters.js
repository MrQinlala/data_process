'use client';

import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  InputAdornment,
  Card,
  CardContent,
  ToggleButtonGroup,
  ToggleButton
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList';
import { useTranslation } from 'react-i18next';
import { useDebounce } from '@/hooks/useDebounce';
import { useEffect, useState } from 'react';
import { imageStyles } from '../styles/imageStyles';

export default function ImageFilters({
  imageName,
  onImageNameChange,
  hasQuestions,
  onHasQuestionsChange,
  hasDatasets,
  onHasDatasetsChange,
  viewMode = 'grid',
  onViewModeChange
}) {
  const { t } = useTranslation();
  const [localImageName, setLocalImageName] = useState(imageName);
  const debouncedImageName = useDebounce(localImageName, 500);

  useEffect(() => {
    onImageNameChange(debouncedImageName);
  }, [debouncedImageName]);

  return (
    <Card sx={imageStyles.filterCard}>
      <CardContent>
        <Box sx={imageStyles.filterContent}>
          {/* 搜索框 */}
          <TextField
            placeholder={t('images.searchPlaceholder', { defaultValue: '搜索图片名称...' })}
            value={localImageName}
            onChange={e => setLocalImageName(e.target.value)}
            size="small"
            sx={imageStyles.searchField}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              )
            }}
          />

          {/* 问题状态筛选 */}
          <FormControl size="small" sx={imageStyles.filterSelect}>
            <InputLabel>{t('images.hasQuestions', { defaultValue: '问题状态' })}</InputLabel>
            <Select
              value={hasQuestions}
              onChange={e => onHasQuestionsChange(e.target.value)}
              label={t('images.hasQuestions', { defaultValue: '问题状态' })}
            >
              <MenuItem value="all">{t('common.all', { defaultValue: '全部' })}</MenuItem>
              <MenuItem value="true">{t('images.withQuestions', { defaultValue: '有问题' })}</MenuItem>
              <MenuItem value="false">{t('images.withoutQuestions', { defaultValue: '无问题' })}</MenuItem>
            </Select>
          </FormControl>

          {/* 数据集状态筛选 */}
          <FormControl size="small" sx={imageStyles.filterSelect}>
            <InputLabel>{t('images.hasDatasets', { defaultValue: '数据集状态' })}</InputLabel>
            <Select
              value={hasDatasets}
              onChange={e => onHasDatasetsChange(e.target.value)}
              label={t('images.hasDatasets', { defaultValue: '数据集状态' })}
            >
              <MenuItem value="all">{t('common.all', { defaultValue: '全部' })}</MenuItem>
              <MenuItem value="true">{t('images.withDatasets', { defaultValue: '已生成' })}</MenuItem>
              <MenuItem value="false">{t('images.withoutDatasets', { defaultValue: '未生成' })}</MenuItem>
            </Select>
          </FormControl>

          {/* 视图切换 */}
          {onViewModeChange && (
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(e, newMode) => newMode && onViewModeChange(newMode)}
              size="small"
              sx={imageStyles.viewToggle}
            >
              <ToggleButton value="grid" aria-label="grid view">
                <GridViewIcon fontSize="small" />
              </ToggleButton>
              <ToggleButton value="list" aria-label="list view">
                <ViewListIcon fontSize="small" />
              </ToggleButton>
            </ToggleButtonGroup>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
