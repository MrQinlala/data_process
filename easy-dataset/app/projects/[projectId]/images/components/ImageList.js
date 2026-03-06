'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Box,
  Pagination,
  Tooltip,
  IconButton,
  Avatar,
  Dialog,
  DialogContent,
  Typography,
  Button,
  Checkbox
} from '@mui/material';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import DatasetIcon from '@mui/icons-material/Dataset';
import DeleteIcon from '@mui/icons-material/Delete';
import EditNoteIcon from '@mui/icons-material/EditNote';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useTranslation } from 'react-i18next';
import { imageStyles } from '../styles/imageStyles';

export default function ImageList({
  images,
  total,
  page,
  pageSize,
  onPageChange,
  onGenerateQuestions,
  onGenerateDataset,
  onDelete,
  onAnnotate,
  selectedIds = [],
  onSelectionChange
}) {
  const { t } = useTranslation();
  const [previewImage, setPreviewImage] = useState(null);

  // 处理全选/取消全选
  const handleSelectAll = event => {
    if (event.target.checked) {
      const allIds = images.map(img => img.id);
      onSelectionChange?.(allIds);
    } else {
      onSelectionChange?.([]);
    }
  };

  // 处理单个选择
  const handleSelectOne = (imageId, checked) => {
    if (checked) {
      onSelectionChange?.([...selectedIds, imageId]);
    } else {
      onSelectionChange?.(selectedIds.filter(id => id !== imageId));
    }
  };

  // 判断是否全选
  const isAllSelected = images.length > 0 && selectedIds.length === images.length;
  const isSomeSelected = selectedIds.length > 0 && selectedIds.length < images.length;

  // 格式化日期
  const formatDate = dateString => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 格式化文件大小
  const formatSize = bytes => {
    if (!bytes) return '-';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  if (!images || images.length === 0) {
    return (
      <Box sx={imageStyles.emptyState}>
        <Box sx={imageStyles.emptyIcon}>
          <PhotoLibraryIcon sx={{ fontSize: 60, color: 'primary.main' }} />
        </Box>
        <Typography variant="h5" sx={imageStyles.emptyTitle}>
          {t('images.noImages', { defaultValue: '还没有图片' })}
        </Typography>
        <Typography variant="body2" sx={imageStyles.emptyDescription}>
          {t('images.noImagesDescription', { defaultValue: '开始导入图片，创建您的第一个图片数据集' })}
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 1 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.50' }}>
              <TableCell padding="checkbox">
                <Checkbox indeterminate={isSomeSelected} checked={isAllSelected} onChange={handleSelectAll} />
              </TableCell>
              <TableCell width="60">{t('images.preview', { defaultValue: '预览' })}</TableCell>
              <TableCell>{t('images.fileName', { defaultValue: '文件名' })}</TableCell>
              <TableCell width="120">{t('images.size', { defaultValue: '大小' })}</TableCell>
              <TableCell width="120">{t('images.dimensions', { defaultValue: '尺寸' })}</TableCell>
              <TableCell width="100">{t('images.questionCount', { defaultValue: '问题数' })}</TableCell>
              <TableCell width="100">{t('images.datasetCount', { defaultValue: '数据集数' })}</TableCell>
              <TableCell width="180">{t('images.uploadTime', { defaultValue: '上传时间' })}</TableCell>
              <TableCell width="200" align="center">
                {t('common.actions', { defaultValue: '操作' })}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {images.map(image => (
              <TableRow
                key={image.id}
                hover
                selected={selectedIds.includes(image.id)}
                sx={{
                  '&:hover': {
                    bgcolor: 'action.hover'
                  }
                }}
              >
                {/* 复选框 */}
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedIds.includes(image.id)}
                    onChange={e => handleSelectOne(image.id, e.target.checked)}
                  />
                </TableCell>

                {/* 预览缩略图 */}
                <TableCell>
                  <Avatar
                    src={image.base64 || image.path}
                    alt={image.imageName}
                    variant="rounded"
                    sx={{
                      width: 48,
                      height: 48,
                      cursor: 'pointer',
                      '&:hover': {
                        opacity: 0.8
                      }
                    }}
                    onClick={() => setPreviewImage(image)}
                  />
                </TableCell>

                {/* 文件名 */}
                <TableCell>
                  <Tooltip title={image.imageName}>
                    <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
                      {image.imageName}
                    </Typography>
                  </Tooltip>
                </TableCell>

                {/* 文件大小 */}
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {formatSize(image.size)}
                  </Typography>
                </TableCell>

                {/* 尺寸 */}
                <TableCell>
                  {image.width && image.height ? (
                    <Typography variant="body2" color="text.secondary">
                      {image.width} × {image.height}
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="text.disabled">
                      -
                    </Typography>
                  )}
                </TableCell>

                {/* 问题数 */}
                <TableCell>
                  <Chip
                    label={image.questionCount || 0}
                    size="small"
                    color={image.questionCount > 0 ? 'primary' : 'default'}
                    variant="outlined"
                  />
                </TableCell>

                {/* 数据集数 */}
                <TableCell>
                  <Chip
                    label={image.datasetCount || 0}
                    size="small"
                    color={image.datasetCount > 0 ? 'success' : 'default'}
                    variant="outlined"
                  />
                </TableCell>

                {/* 上传时间 */}
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(image.createAt)}
                  </Typography>
                </TableCell>

                {/* 操作按钮 */}
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                    <Tooltip title={t('images.preview', { defaultValue: '预览' })}>
                      <IconButton size="small" onClick={() => setPreviewImage(image)}>
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={t('images.annotate', { defaultValue: '标注' })}>
                      <IconButton size="small" color="primary" onClick={() => onAnnotate(image)}>
                        <EditNoteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={t('images.generateQuestions', { defaultValue: '生成问题' })}>
                      <IconButton size="small" onClick={() => onGenerateQuestions(image)}>
                        <QuestionMarkIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={t('images.generateDataset', { defaultValue: '生成数据集' })}>
                      <IconButton size="small" onClick={() => onGenerateDataset(image)}>
                        <DatasetIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={t('common.delete', { defaultValue: '删除' })}>
                      <IconButton size="small" color="error" onClick={() => onDelete(image.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 分页 */}
      {total > pageSize && (
        <Box sx={imageStyles.pagination}>
          <Pagination
            count={Math.ceil(total / pageSize)}
            page={page}
            onChange={(_, newPage) => onPageChange(newPage)}
            color="primary"
            size="large"
            showFirstButton
            showLastButton
          />
        </Box>
      )}

      {/* 图片预览对话框 */}
      <Dialog
        open={!!previewImage}
        onClose={() => setPreviewImage(null)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'transparent',
            boxShadow: 'none',
            overflow: 'hidden'
          }
        }}
      >
        <DialogContent
          sx={{ p: 0, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          {previewImage && (
            <Box sx={{ width: '100%', textAlign: 'center' }}>
              <img
                src={previewImage.base64 || previewImage.path}
                alt={previewImage.imageName}
                style={{
                  maxWidth: '100%',
                  maxHeight: '90vh',
                  objectFit: 'contain'
                }}
              />
              <Typography
                variant="caption"
                sx={{ display: 'block', mt: 2, color: 'white', textShadow: '0 0 4px rgba(0,0,0,0.8)' }}
              >
                {previewImage.imageName}
              </Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
