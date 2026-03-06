import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export function useMonitoringData() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [summaryData, setSummaryData] = useState({
    summary: {
      totalTokens: 0,
      inputTokens: 0,
      outputTokens: 0,
      totalCalls: 0,
      successCalls: 0,
      failedCalls: 0,
      totalLatency: 0,
      avgLatency: 0,
      avgTokensPerCall: 0,
      failureRate: 0
    },
    trend: [],
    modelDistribution: [],
    projects: [],
    providers: []
  });

  const [logsData, setLogsData] = useState({
    details: [],
    total: 0,
    page: 1,
    pageSize: 10,
    totalPages: 0
  });

  const [filters, setFilters] = useState({
    timeRange: '7d',
    projectId: 'all',
    provider: 'all',
    status: 'all'
  });

  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10
  });

  const [searchTerm, setSearchTerm] = useState('');

  // 获取汇总数据
  const fetchSummary = useCallback(async () => {
    try {
      const response = await axios.get('/api/monitoring/summary', {
        params: filters
      });
      setSummaryData(response.data);
    } catch (error) {
      console.error('Failed to fetch monitoring summary:', error);
      toast.error(t('monitoring.errors.fetchSummaryFailed'));
    }
  }, [filters, t]);

  // 获取日志列表
  const fetchLogs = useCallback(async () => {
    try {
      const response = await axios.get('/api/monitoring/logs', {
        params: {
          ...filters,
          page: pagination.page,
          pageSize: pagination.pageSize,
          search: searchTerm
        }
      });
      setLogsData(response.data);
    } catch (error) {
      console.error('Failed to fetch monitoring logs:', error);
      toast.error(t('monitoring.errors.fetchLogsFailed'));
    }
  }, [filters, pagination, searchTerm, t]);

  // 初始加载
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchSummary(), fetchLogs()]);
      setLoading(false);
    };
    fetchData();
  }, [fetchSummary, fetchLogs]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // 重置到第一页
  };

  const handlePageChange = newPage => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handlePageSizeChange = newPageSize => {
    setPagination({ page: 1, pageSize: newPageSize });
  };

  const handleSearchChange = term => {
    setSearchTerm(term);
    setPagination(prev => ({ ...prev, page: 1 })); // 重置到第一页
  };

  const refresh = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchSummary(), fetchLogs()]);
    setLoading(false);
  }, [fetchSummary, fetchLogs]);

  return {
    loading,
    summaryData,
    logsData,
    filters,
    pagination,
    searchTerm,
    handleFilterChange,
    handlePageChange,
    handlePageSizeChange,
    handleSearchChange,
    refresh
  };
}
