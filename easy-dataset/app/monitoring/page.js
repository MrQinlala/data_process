'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Stack,
  Button,
  FormControl,
  Select,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
  useTheme
} from '@mui/material';
import {
  Download as DownloadIcon,
  FilterList as FilterListIcon,
  CloudQueue as CloudQueueIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import Navbar from '@/components/Navbar/index';
import StatsCards from './components/StatsCards';
import Charts from './components/Charts';
import UsageTable from './components/UsageTable';
import { useMonitoringData } from './hooks/useMonitoringData';

export default function MonitoringPage() {
  const theme = useTheme();
  const { t } = useTranslation();
  const [projects, setProjects] = useState([]);
  const {
    loading,
    summaryData,
    logsData,
    filters,
    pagination,
    searchTerm,
    handleFilterChange,
    handlePageChange,
    handlePageSizeChange,
    handleSearchChange
  } = useMonitoringData();

  // 获取项目列表用于 Navbar
  useEffect(() => {
    async function fetchProjects() {
      try {
        const response = await fetch('/api/projects');
        if (response.ok) {
          const data = await response.json();
          setProjects(data);
        }
      } catch (error) {
        console.error('Failed to fetch projects:', error);
      }
    }
    fetchProjects();
  }, []);

  const handleTimeRangeChange = (event, newRange) => {
    if (newRange !== null) {
      handleFilterChange('timeRange', newRange);
    }
  };

  const handleExport = () => {
    // 简单的导出功能实现，将当前 logsData.details 导出为 CSV
    if (!logsData.details || logsData.details.length === 0) return;

    const headers = [
      t('monitoring.table.columns.projectName'),
      t('monitoring.table.columns.provider'),
      t('monitoring.table.columns.model'),
      t('monitoring.table.columns.status'),
      t('monitoring.table.columns.failureReason'),
      t('monitoring.table.columns.inputTokens'),
      t('monitoring.table.columns.outputTokens'),
      t('monitoring.table.columns.totalTokens'),
      t('monitoring.table.columns.calls'),
      t('monitoring.table.columns.avgLatency')
    ];
    const csvContent = [
      headers.join(','),
      ...logsData.details.map(row =>
        [
          row.projectName,
          row.provider,
          row.model,
          row.status,
          (row.failureReason || '').replace(/,/g, ' '),
          row.inputTokens,
          row.outputTokens,
          row.totalTokens,
          row.calls,
          row.avgLatency
        ].join(',')
      )
    ].join('\n');

    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `llm-monitoring-export-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  return (
    <>
      <Navbar projects={projects} currentProject={null} />
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 8 }}>
        <Container maxWidth="xl" sx={{ pt: 4 }}>
          {/* Header Area */}
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', md: 'center' }}
            spacing={2}
            mb={4}
          >
            {/* Time Range Selector */}
            <ToggleButtonGroup
              value={filters.timeRange}
              exclusive
              onChange={handleTimeRangeChange}
              aria-label="time range"
              size="small"
              sx={{
                bgcolor: 'background.paper',
                '& .MuiToggleButton-root': {
                  px: 3,
                  py: 1,
                  border: `1px solid ${theme.palette.divider}`,
                  textTransform: 'none',
                  fontWeight: 500,
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    '&:hover': {
                      bgcolor: 'primary.dark'
                    }
                  }
                }
              }}
            >
              <ToggleButton value="24h">{t('monitoring.timeRange.24h')}</ToggleButton>
              <ToggleButton value="7d">{t('monitoring.timeRange.7d')}</ToggleButton>
              <ToggleButton value="30d">{t('monitoring.timeRange.30d')}</ToggleButton>
            </ToggleButtonGroup>

            {/* Filters & Actions */}
            <Stack direction="row" spacing={2} alignItems="center">
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                  value={filters.projectId}
                  onChange={e => handleFilterChange('projectId', e.target.value)}
                  displayEmpty
                  startAdornment={<FilterListIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />}
                  sx={{ bgcolor: 'background.paper' }}
                >
                  <MenuItem value="all">{t('monitoring.filters.allProjects')}</MenuItem>
                  {summaryData.projects.map(p => (
                    <MenuItem key={p.id} value={p.id}>
                      {p.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                  value={filters.provider}
                  onChange={e => handleFilterChange('provider', e.target.value)}
                  displayEmpty
                  startAdornment={<CloudQueueIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />}
                  sx={{ bgcolor: 'background.paper' }}
                >
                  <MenuItem value="all">{t('monitoring.filters.allProviders')}</MenuItem>
                  {summaryData.providers.map(provider => (
                    <MenuItem key={provider} value={provider}>
                      {provider}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                  value={filters.status}
                  onChange={e => handleFilterChange('status', e.target.value)}
                  displayEmpty
                  startAdornment={<CheckCircleIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />}
                  sx={{ bgcolor: 'background.paper' }}
                >
                  <MenuItem value="all">{t('monitoring.filters.allStatus')}</MenuItem>
                  <MenuItem value="SUCCESS">{t('monitoring.status.success')}</MenuItem>
                  <MenuItem value="FAILED">{t('monitoring.status.failed')}</MenuItem>
                </Select>
              </FormControl>

              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={handleExport}
                sx={{ textTransform: 'none', px: 3 }}
              >
                {t('monitoring.actions.export')}
              </Button>
            </Stack>
          </Stack>

          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
              <CircularProgress />
            </Box>
          ) : (
            <Stack spacing={3}>
              {/* 统计卡片 */}
              <StatsCards data={summaryData.summary} />

              {/* 图表区域 */}
              <Charts trendData={summaryData.trend} modelDistribution={summaryData.modelDistribution} />

              {/* 详细表格 */}
              <UsageTable
                data={logsData.details}
                total={logsData.total}
                page={pagination.page}
                pageSize={pagination.pageSize}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                searchTerm={searchTerm}
                onSearchChange={handleSearchChange}
              />
            </Stack>
          )}
        </Container>
      </Box>
    </>
  );
}
