'use client';

import { useState, useEffect } from 'react';
import { Box, Chip, TextField, Autocomplete, Typography, IconButton, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';

/**
 * 标签选择器组件
 * 支持从已有标签选择和自定义添加新标签
 */
export default function TagSelector({
  value = [],
  onChange,
  availableTags = [],
  placeholder,
  readOnly = false,
  maxTags = 10
}) {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState('');

  // 确保 value 始终是数组
  const normalizeValue = val => {
    if (Array.isArray(val)) {
      return val;
    }
    if (typeof val === 'string') {
      try {
        const parsed = JSON.parse(val);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  const [selectedTags, setSelectedTags] = useState(() => normalizeValue(value));

  // 同步外部value变化
  useEffect(() => {
    setSelectedTags(normalizeValue(value));
  }, [value]);

  // 处理标签变更
  const handleTagsChange = newTags => {
    setSelectedTags(newTags);
    if (onChange) {
      onChange(newTags);
    }
  };

  // 添加新标签
  const handleAddTag = newTag => {
    if (!newTag || newTag.trim() === '') return;

    const trimmedTag = newTag.trim();
    if (selectedTags.includes(trimmedTag)) return;

    if (selectedTags.length >= maxTags) {
      return;
    }

    const updatedTags = [...selectedTags, trimmedTag];
    handleTagsChange(updatedTags);
    setInputValue('');
  };

  // 删除标签
  const handleDeleteTag = tagToDelete => {
    const updatedTags = selectedTags.filter(tag => tag !== tagToDelete);
    handleTagsChange(updatedTags);
  };

  // 处理键盘事件
  const handleKeyPress = event => {
    if (event.key === 'Enter' && inputValue.trim()) {
      event.preventDefault();
      handleAddTag(inputValue);
    }
  };

  // 获取可选的标签选项（排除已选择的）
  const getAvailableOptions = () => {
    return availableTags.filter(tag => !selectedTags.includes(tag));
  };

  if (readOnly) {
    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {selectedTags.length > 0 ? (
          selectedTags.map((tag, index) => (
            <Chip key={index} label={tag} size="small" variant="outlined" color="primary" />
          ))
        ) : (
          <Typography variant="body2" color="text.secondary">
            {t('tags.noTags', '暂无标签')}
          </Typography>
        )}
      </Box>
    );
  }

  return (
    <Box>
      {/* 已选择的标签 */}
      {selectedTags.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {selectedTags.map((tag, index) => (
            <Chip
              key={index}
              label={tag}
              size="small"
              variant="outlined"
              color="primary"
              onDelete={() => handleDeleteTag(tag)}
              deleteIcon={<CloseIcon />}
            />
          ))}
        </Box>
      )}

      {/* 标签输入区域 */}
      {selectedTags.length < maxTags && (
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
          <Autocomplete
            freeSolo
            options={getAvailableOptions()}
            inputValue={inputValue}
            onInputChange={(event, newInputValue) => {
              setInputValue(newInputValue);
            }}
            onChange={(event, newValue) => {
              if (newValue) {
                handleAddTag(newValue);
              }
            }}
            renderInput={params => (
              <TextField
                {...params}
                size="small"
                placeholder={placeholder || t('tags.addTag', '添加标签...')}
                onKeyPress={handleKeyPress}
                sx={{ minWidth: 200 }}
              />
            )}
            renderOption={(props, option) => (
              <Box component="li" {...props}>
                <Typography variant="body2">{option}</Typography>
              </Box>
            )}
            sx={{ flexGrow: 1 }}
          />

          <Tooltip title={t('tags.addCustomTag', '添加自定义标签')}>
            <IconButton
              size="small"
              onClick={() => handleAddTag(inputValue)}
              disabled={!inputValue.trim()}
              color="primary"
            >
              <AddIcon />
            </IconButton>
          </Tooltip>
        </Box>
      )}

      {/* 标签数量提示 */}
      {selectedTags.length >= maxTags && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
          {t('tags.maxTagsReached', `最多可添加 ${maxTags} 个标签`)}
        </Typography>
      )}

      {/* 可用标签提示 */}
      {availableTags.length > 0 && selectedTags.length < maxTags && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          {t('tags.availableTagsHint', '可从已有标签中选择，或输入新标签')}
        </Typography>
      )}
    </Box>
  );
}
