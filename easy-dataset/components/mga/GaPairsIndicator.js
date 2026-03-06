'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Chip,
  Typography,
  IconButton,
  Tooltip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from '@mui/material';
import { Psychology as PsychologyIcon, AutoAwesome as AutoFixIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import GaPairsManager from './GaPairsManager';

/**
 * GA Pairs Indicator Component - Shows GA pairs status for a file
 * @param {Object} props
 * @param {string} props.projectId - Project ID
 * @param {string} props.fileId - File ID
 * @param {string} props.fileName - File name for display
 */
export default function GaPairsIndicator({ projectId, fileId, fileName = '未命名文件' }) {
  const { t } = useTranslation();
  const [gaPairs, setGaPairs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // 获取GA对状态的函数
  const fetchGaPairsStatus = useCallback(async () => {
    try {
      setLoading(true);

      const response = await fetch(`/api/projects/${projectId}/files/${fileId}/ga-pairs`);

      if (!response.ok) {
        if (response.status === 404) {
          setGaPairs([]);
          return;
        }
        throw new Error(`HTTP ${response.status}: Failed to load GA pairs`);
      }

      const result = await response.json();

      // 处理响应格式
      let newGaPairs = [];
      if (Array.isArray(result)) {
        newGaPairs = result;
      } else if (result?.data) {
        newGaPairs = result.data;
      }

      setGaPairs(newGaPairs);
    } catch (error) {
      console.error('获取GA对状态失败:', error);
      setGaPairs([]);
    } finally {
      setLoading(false);
    }
  }, [projectId, fileId]);

  // 初始加载
  useEffect(() => {
    if (projectId && fileId) {
      fetchGaPairsStatus();
    }
  }, [projectId, fileId, fetchGaPairsStatus]);

  //监听外部事件
  useEffect(() => {
    const handleRefresh = event => {
      const { projectId: eventProjectId, fileIds } = event.detail || {};

      if (eventProjectId === projectId && fileIds?.includes(String(fileId))) {
        fetchGaPairsStatus();
      }
    };

    window.addEventListener('refreshGaPairsIndicators', handleRefresh);
    return () => window.removeEventListener('refreshGaPairsIndicators', handleRefresh);
  }, [projectId, fileId, fetchGaPairsStatus]);

  // 计算激活的GA对数量
  const activePairs = gaPairs.filter(pair => pair.isActive);
  const hasGaPairs = gaPairs.length > 0;

  //GA对变化回调处理
  const handleGaPairsChange = useCallback(newGaPairs => {
    setGaPairs(newGaPairs || []);
  }, []);

  const handleOpenDialog = useCallback(() => {
    setDetailsOpen(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setDetailsOpen(false);
  }, []);

  //加载状态显示
  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CircularProgress size={16} />
        <Typography variant="caption" color="textSecondary">
          Loading...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {hasGaPairs ? (
        <Chip
          icon={<PsychologyIcon />}
          label={`${activePairs.length}/${gaPairs.length} GA Pairs`}
          size="small"
          color={activePairs.length > 0 ? 'primary' : 'default'}
          variant={activePairs.length > 0 ? 'filled' : 'outlined'}
          onClick={handleOpenDialog}
        />
      ) : (
        <Tooltip title="Generate GA Pairs">
          <IconButton size="small" onClick={handleOpenDialog} color="primary">
            <AutoFixIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onClose={handleCloseDialog} maxWidth="lg" fullWidth>
        <DialogTitle>GA Pairs for {fileName}</DialogTitle>
        <DialogContent>
          {detailsOpen && (
            <GaPairsManager projectId={projectId} fileId={fileId} onGaPairsChange={handleGaPairsChange} />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
