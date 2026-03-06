'use client';

import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  Card,
  CardActionArea,
  Chip,
  IconButton,
  Tooltip,
  InputAdornment,
  CircularProgress,
  DialogTitle,
  DialogContentText
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import StorageIcon from '@mui/icons-material/Storage';
import { useTranslation } from 'react-i18next';
import { alpha, useTheme } from '@mui/material/styles';
import { StyledDialogTitle } from './ImportDialog.styles';
import { DATA_SETS } from '../constants';

export default function BuiltinDatasetDialog({ open, onClose, projectId, onSuccess }) {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const [keyword, setKeyword] = useState('');
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const isZh = i18n.language.startsWith('zh');

  // 过滤数据集
  const filteredDatasets = useMemo(() => {
    if (!keyword) return DATA_SETS;
    const lowerKeyword = keyword.toLowerCase();
    return DATA_SETS.filter(
      ds =>
        ds.zh.toLowerCase().includes(lowerKeyword) ||
        ds.en.toLowerCase().includes(lowerKeyword) ||
        ds.type.toLowerCase().includes(lowerKeyword)
    );
  }, [keyword]);

  const handleCardClick = dataset => {
    setSelectedDataset(dataset);
    setConfirmOpen(true);
  };

  const handleConfirmClose = () => {
    setConfirmOpen(false);
    setSelectedDataset(null);
  };

  const handleImport = async () => {
    if (!selectedDataset) return;

    setDownloading(true);
    setConfirmOpen(false);

    try {
      const cdnUrl = `https://raw.githubusercontent.com/ConardLi/easy-dataset-eval/main/${selectedDataset.file}`;
      const response = await fetch(cdnUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch dataset: ${response.statusText}`);
      }
      const jsonData = await response.blob();

      const formData = new FormData();
      const file = new File([jsonData], `${selectedDataset.en}.json`, { type: 'application/json' });
      formData.append('file', file);
      formData.append('questionType', selectedDataset.type);
      const tags = `[${selectedDataset.level}] ${selectedDataset.en}`;
      formData.append('tags', tags);

      const importResponse = await fetch(`/api/projects/${projectId}/eval-datasets/import`, {
        method: 'POST',
        body: formData
      });

      const result = await importResponse.json();

      if (result.code === 0) {
        onSuccess?.(result.data);
        handleClose();
      } else {
        console.error(result.error);
        alert(result.error || t('evalDatasets.import.failed'));
      }
    } catch (error) {
      console.error('Import failed:', error);
      alert(error.message || t('evalDatasets.import.failed'));
    } finally {
      setDownloading(false);
      setSelectedDataset(null);
    }
  };

  const handleClose = () => {
    if (downloading) return;
    setKeyword('');
    setSelectedDataset(null);
    setConfirmOpen(false);
    onClose();
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <StyledDialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <StorageIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {t('evalDatasets.import.builtinTitle', '选择内置数据集')}
            </Typography>
          </Box>
          <IconButton onClick={handleClose} disabled={downloading} size="small">
            <CloseIcon />
          </IconButton>
        </StyledDialogTitle>

        <DialogContent
          dividers
          sx={{
            p: 0,
            display: 'flex',
            flexDirection: 'column',
            height: '70vh',
            bgcolor: alpha(theme.palette.grey[50], 0.5)
          }}
        >
          {/* 搜索栏 */}
          <Box sx={{ p: 2, bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
            <TextField
              fullWidth
              size="small"
              placeholder={t('evalDatasets.import.searchPlaceholder', '搜索数据集...')}
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'text.disabled', fontSize: 20 }} />
                  </InputAdornment>
                ),
                sx: { borderRadius: 2 }
              }}
            />
          </Box>

          {/* 数据集列表 */}
          <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
            {downloading ? (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  gap: 2
                }}
              >
                <CircularProgress size={32} thickness={4} />
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  {t('evalDatasets.import.downloading', '下载并导入中...')}
                </Typography>
              </Box>
            ) : (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                  gap: 1.5,
                  alignContent: 'start'
                }}
              >
                {filteredDatasets.map((ds, index) => {
                  const difficultyColor = ds.level === 'easy' ? 'success.main' : 'warning.main';
                  const typeLabel = t(`eval.questionTypes.${ds.type}`, ds.type);
                  const tooltipTitle = (
                    <Box sx={{ display: 'flex', gap: 0.8, p: 0.5 }}>
                      <Chip
                        label={typeLabel}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.65rem',
                          bgcolor: alpha('#fff', 0.15),
                          color: '#fff',
                          border: '1px solid',
                          borderColor: alpha('#fff', 0.1),
                          fontWeight: 500
                        }}
                      />
                      <Chip
                        label={ds.level.toUpperCase()}
                        size="small"
                        color={ds.level === 'easy' ? 'success' : 'warning'}
                        sx={{
                          height: 20,
                          fontSize: '0.65rem',
                          fontWeight: 800,
                          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                        }}
                      />
                    </Box>
                  );

                  return (
                    <Tooltip
                      key={index}
                      title={tooltipTitle}
                      arrow
                      placement="top"
                      componentsProps={{
                        tooltip: {
                          sx: {
                            bgcolor: 'rgba(33, 33, 33, 0.95)',
                            backdropFilter: 'blur(4px)',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                            borderRadius: 1.5,
                            padding: '4px 8px'
                          }
                        },
                        arrow: {
                          sx: {
                            color: 'rgba(33, 33, 33, 0.95)'
                          }
                        }
                      }}
                    >
                      <Card
                        variant="outlined"
                        sx={{
                          borderRadius: 2,
                          border: `1px solid ${theme.palette.divider}`,
                          borderLeft: '4px solid',
                          borderLeftColor: difficultyColor,
                          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                          bgcolor: 'background.paper',
                          cursor: 'pointer',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.1)}`,
                            borderColor: theme.palette.primary.main,
                            '& .dataset-title': { color: 'primary.main' }
                          }
                        }}
                        onClick={() => handleCardClick(ds)}
                      >
                        <CardActionArea
                          sx={{
                            p: 1.5,
                            height: '100%',
                            minHeight: 64,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-start'
                          }}
                        >
                          <Typography
                            className="dataset-title"
                            variant="subtitle2"
                            sx={{
                              fontSize: '0.85rem',
                              fontWeight: 600,
                              lineHeight: 1.3,
                              color: 'text.primary',
                              transition: 'color 0.2s',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              width: '100%'
                            }}
                          >
                            {isZh ? ds.zh : ds.en}
                          </Typography>
                        </CardActionArea>
                      </Card>
                    </Tooltip>
                  );
                })}
              </Box>
            )}
          </Box>
        </DialogContent>
      </Dialog>

      <Dialog
        open={confirmOpen}
        onClose={handleConfirmClose}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
          {t('evalDatasets.import.confirmImportTitle', '确认导入')}
        </DialogTitle>
        <DialogContent sx={{ pb: 1 }}>
          <DialogContentText sx={{ color: 'text.primary' }}>
            {selectedDataset &&
              t('evalDatasets.import.confirmImportMessage', {
                name: isZh ? selectedDataset.zh : selectedDataset.en
              })}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 1.5 }}>
          <Button onClick={handleConfirmClose} color="inherit" sx={{ fontWeight: 600 }}>
            {t('common.cancel', '取消')}
          </Button>
          <Button onClick={handleImport} variant="contained" autoFocus sx={{ fontWeight: 600, px: 3 }}>
            {t('evalDatasets.import.import', '导入')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
