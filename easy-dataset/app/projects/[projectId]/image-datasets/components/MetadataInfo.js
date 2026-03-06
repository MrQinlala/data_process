'use client';

import { Box, Typography, Chip, alpha, Divider } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/material/styles';

/**
 * 元数据信息展示组件 - Chip 形式（参考 DatasetMetadata）
 */
export default function MetadataInfo({ dataset }) {
  const { t } = useTranslation();
  const theme = useTheme();

  // 解析标签
  const parsedTags = (() => {
    try {
      if (typeof dataset.tags === 'string' && dataset.tags) {
        return JSON.parse(dataset.tags);
      }
      return Array.isArray(dataset.tags) ? dataset.tags : [];
    } catch {
      return [];
    }
  })();

  // 格式化文件大小
  const formatFileSize = bytes => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Box sx={{ mb: 3 }}>
      {/* 数据集信息 */}
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 1 }}>
        {t('common.detailInfo', '详细信息')}
      </Typography>
      <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 2 }}>
        {/* 使用模型 */}
        {dataset.model && (
          <Chip
            label={`${t('imageDatasets.modelInfo', '使用模型')}: ${dataset.model}`}
            variant="outlined"
            size="small"
          />
        )}

        {/* 标签数量 */}
        {parsedTags.length > 0 && (
          <Chip
            label={`${t('imageDatasets.tags', '标签')}: ${parsedTags.length} ${t('common.items', '项')}`}
            color="primary"
            variant="outlined"
            size="small"
          />
        )}

        {/* 创建时间 */}
        <Chip
          label={`${t('imageDatasets.createdAt', '创建时间')}: ${new Date(dataset.createAt).toLocaleString('zh-CN', {
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          })}`}
          variant="outlined"
          size="small"
        />

        {/* 文本块信息 */}
        {dataset.questionTemplate?.description && (
          <Chip
            label={`${t('imageDatasets.description', '描述')}: ${dataset.questionTemplate.description}`}
            variant="outlined"
            size="small"
            sx={{ maxWidth: '100%' }}
          />
        )}

        {/* 确认状态 */}
        {dataset.confirmed && (
          <Chip
            label={t('datasets.confirmed', '已确认')}
            size="small"
            sx={{
              backgroundColor: alpha(theme.palette.success.main, 0.1),
              color: theme.palette.success.dark,
              fontWeight: 'medium'
            }}
          />
        )}
      </Box>

      {/* 图片信息 */}
      {dataset.image && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 1 }}>
            {t('images.imageInfo', '图片信息')}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            {/* 图片尺寸 */}
            {dataset.image.width && dataset.image.height && (
              <Chip
                label={`${t('images.resolution', '分辨率')}: ${dataset.image.width}×${dataset.image.height}`}
                variant="outlined"
                size="small"
              />
            )}

            {/* 文件大小 */}
            {dataset.image.size && (
              <Chip
                label={`${t('images.fileSize', '文件大小')}: ${formatFileSize(dataset.image.size)}`}
                variant="outlined"
                size="small"
              />
            )}

            {/* 图片创建时间 */}
            {dataset.image.createAt && (
              <Chip
                label={`${t('images.uploadTime', '上传时间')}: ${new Date(dataset.image.createAt).toLocaleString(
                  'zh-CN',
                  {
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  }
                )}`}
                variant="outlined"
                size="small"
              />
            )}

            {/* 图片名称 */}
            {dataset.image.imageName && (
              <Chip
                label={`${t('images.fileName', '文件名')}: ${dataset.image.imageName}`}
                variant="outlined"
                size="small"
                sx={{ maxWidth: '100%' }}
              />
            )}
          </Box>
        </>
      )}
    </Box>
  );
}
