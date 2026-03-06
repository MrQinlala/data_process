'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Autocomplete,
  TextField as MuiTextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import axios from 'axios';

export default function QuestionEditDialog({
  open,
  onClose,
  onSubmit,
  initialData,
  projectId,
  tags,
  mode = 'create' // 'create' or 'edit'
}) {
  const [chunks, setChunks] = useState([]);
  const [images, setImages] = useState([]);
  const { t } = useTranslation();

  // 获取文本块的标题
  const getChunkTitle = chunkId => {
    const chunk = chunks.find(c => c.id === chunkId);
    return chunk?.name || chunkId; // 直接使用文件名
  };

  const [formData, setFormData] = useState({
    id: '',
    question: '',
    sourceType: 'text', // 新增：数据源类型
    chunkId: '',
    imageId: '', // 新增：图片ID
    label: '' // 默认不选中任何标签
  });

  const getChunks = async projectId => {
    // 获取文本块列表
    const response = await axios.get(`/api/projects/${projectId}/split`);
    if (response.status !== 200) {
      throw new Error(t('common.fetchError'));
    }
    setChunks(response.data.chunks || []);
  };

  const getImages = async projectId => {
    // 获取图片列表（只获取ID和名称）
    try {
      const response = await axios.get(`/api/projects/${projectId}/images?page=1&pageSize=10000&simple=true`);
      if (response.status === 200) {
        setImages(response.data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch images:', error);
    }
  };

  useEffect(() => {
    getChunks(projectId);
    getImages(projectId);
    if (initialData) {
      // 根据 imageId 判断数据源类型
      console.log('initialData:', initialData);
      const sourceType = initialData.imageId ? 'image' : 'text';
      setFormData({
        id: initialData.id,
        question: initialData.question || '',
        sourceType: sourceType,
        chunkId: initialData.chunkId || '',
        imageId: initialData.imageId || '',
        label: initialData.label || 'other' // 改用 label 而不是 label
      });
    } else {
      setFormData({
        id: '',
        question: '',
        sourceType: 'text',
        chunkId: '',
        imageId: '',
        label: ''
      });
    }
  }, [initialData]);

  const handleSubmit = () => {
    onSubmit(formData);
    onClose();
  };

  const flattenTags = (tags = [], prefix = '') => {
    let flatTags = [];
    const traverse = node => {
      flatTags.push({
        id: node.label, // 使用标签名作为 id
        label: node.label, // 直接使用原始标签名
        originalLabel: node.label
      });
      if (node.child && node.child.length > 0) {
        node.child.forEach(child => traverse(child));
      }
    };
    tags.forEach(tag => traverse(tag));
    flatTags.push({
      id: 'other',
      label: t('datasets.uncategorized'),
      originalLabel: 'other'
    });
    return flatTags;
  };

  const flattenedTags = useMemo(() => flattenTags(tags), [tags, t]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{mode === 'create' ? t('questions.createQuestion') : t('questions.editQuestion')}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          {/* 数据源类型选择 */}
          <FormControl fullWidth>
            <InputLabel>{t('questions.sourceType', { defaultValue: '数据源类型' })}</InputLabel>
            <Select
              value={formData.sourceType}
              label={t('questions.sourceType', { defaultValue: '数据源类型' })}
              onChange={e => {
                setFormData({
                  ...formData,
                  sourceType: e.target.value,
                  chunkId: '',
                  imageId: ''
                });
              }}
            >
              <MenuItem value="text">{t('questions.template.sourceType.text')}</MenuItem>
              <MenuItem value="image">{t('questions.template.sourceType.image')}</MenuItem>
            </Select>
          </FormControl>

          {/* 问题内容 */}
          <TextField
            label={t('questions.questionContent')}
            multiline
            rows={4}
            fullWidth
            value={formData.question}
            onChange={e => setFormData({ ...formData, question: e.target.value })}
          />

          {/* 文本块选择（仅当数据源为文本时显示） */}
          {formData.sourceType === 'text' && (
            <Autocomplete
              fullWidth
              options={chunks}
              getOptionLabel={chunk => getChunkTitle(chunk.id)}
              value={chunks.find(chunk => chunk.id === formData.chunkId) || null}
              onChange={(e, newValue) => setFormData({ ...formData, chunkId: newValue ? newValue.id : '' })}
              renderInput={params => (
                <MuiTextField {...params} label={t('questions.selectChunk')} placeholder={t('questions.searchChunk')} />
              )}
            />
          )}

          {/* 图片选择（仅当数据源为图片时显示） */}
          {formData.sourceType === 'image' && (
            <Autocomplete
              fullWidth
              options={images}
              getOptionLabel={image => image.imageName || ''}
              value={images.find(image => image.id === formData.imageId) || null}
              onChange={(e, newValue) => setFormData({ ...formData, imageId: newValue ? newValue.id : '' })}
              renderInput={params => (
                <MuiTextField
                  {...params}
                  label={t('questions.selectImage', { defaultValue: '选择图片' })}
                  placeholder={t('questions.searchImage', { defaultValue: '搜索图片...' })}
                />
              )}
            />
          )}

          {/* 标签选择 */}
          {formData.sourceType === 'text' && (
            <Autocomplete
              fullWidth
              options={flattenedTags}
              getOptionLabel={tag => tag.label}
              value={flattenedTags.find(tag => tag.id === formData.label) || null}
              onChange={(e, newValue) => setFormData({ ...formData, label: newValue ? newValue.id : '' })}
              renderInput={params => (
                <MuiTextField {...params} label={t('questions.selectTag')} placeholder={t('questions.searchTag')} />
              )}
            />
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('common.cancel')}</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!formData.question || (formData.sourceType === 'text' ? !formData.chunkId : !formData.imageId)}
        >
          {mode === 'create' ? t('common.create') : t('common.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
