'use client';

import { useParams, useRouter } from 'next/navigation';
import {
  Container,
  Box,
  Button,
  CircularProgress,
  Alert,
  Typography,
  LinearProgress,
  Paper,
  Grid,
  Pagination
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useTranslation } from 'react-i18next';
import useEvalTaskDetail from '../hooks/useEvalTaskDetail';
import { detailStyles } from './detailStyles';
import EvalHeader from './components/EvalHeader';
import EvalStats from './components/EvalStats';
import QuestionCard from './components/QuestionCard';

export default function EvalTaskDetailPage() {
  const { projectId, taskId } = useParams();
  const router = useRouter();
  const { t } = useTranslation();

  const {
    task,
    results,
    stats,
    total,
    page,
    setPage,
    pageSize,
    filterType,
    setFilterType,
    filterCorrect,
    setFilterCorrect,
    loading,
    error,
    setError,
    loadData
  } = useEvalTaskDetail(projectId, taskId);

  const handleFilterSelect = type => {
    setFilterType(type);
    setPage(1); // 切换筛选时重置到第一页
  };

  const handleFilterCorrectSelect = isCorrect => {
    setFilterCorrect(isCorrect);
    setPage(1); // 切换筛选时重置到第一页
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    // 滚动到试卷顶部
    document.getElementById('paper-top')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading && !task) {
    return (
      <Container
        maxWidth="xl"
        sx={{ ...detailStyles.pageContainer, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
      >
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Box sx={detailStyles.pageContainer}>
      <Container maxWidth="xl">
        {/* 顶部导航栏 */}
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => router.back()}
            sx={{ color: 'text.secondary', fontWeight: 600 }}
          >
            {t('common.back')}
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadData}
            disabled={loading}
            size="small"
            sx={{ bgcolor: 'white' }}
          >
            {t('common.refresh')}
          </Button>
        </Box>

        {/* 错误提示 */}
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* 任务进度（仅进行中时显示） */}
        {task?.status === 0 && (
          <Paper sx={{ p: 3, mb: 4, borderRadius: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="subtitle2" fontWeight="bold">
                {t('evalTasks.statusProcessing')}...
              </Typography>
              <Typography variant="body2" color="primary">
                {task.completedCount}/{task.totalCount}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={task.totalCount > 0 ? (task.completedCount / task.totalCount) * 100 : 0}
              sx={{ height: 10, borderRadius: 5 }}
            />
          </Paper>
        )}

        {/* 核心内容区 */}
        {task && (
          <>
            {/* 头部概览 */}
            <EvalHeader
              task={task}
              stats={stats}
              filterCorrect={filterCorrect}
              onFilterCorrectSelect={handleFilterCorrectSelect}
            />

            {/* 统计图表 & 筛选 */}
            <EvalStats stats={stats} currentFilter={filterType} onFilterSelect={handleFilterSelect} />

            {/* 试卷主体 */}
            <Box sx={detailStyles.paperContainer} id="paper-top">
              {/* 试卷抬头 */}
              <Box sx={detailStyles.paperHeader}>
                <Typography sx={detailStyles.paperTitle}>{t('evalTasks.reportTitle', '模型能力评估报告')}</Typography>
                <Box
                  sx={{
                    mt: 2,
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 3,
                    color: 'text.secondary',
                    fontSize: '0.875rem'
                  }}
                >
                  <Typography variant="caption">
                    {t('evalTasks.taskIdLabel', '任务 ID')}: {taskId}
                  </Typography>
                  <Typography variant="caption">
                    {t('evalTasks.pageInfo', '第 {{page}} / {{totalPages}} 页', {
                      page,
                      totalPages: Math.ceil(total / pageSize)
                    })}
                  </Typography>
                </Box>
              </Box>

              {/* 题目列表 (双列布局) */}
              <Box sx={{ p: 3, bgcolor: '#fff' }}>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <Grid container spacing={3}>
                    {results?.map((result, index) => (
                      <Grid item xs={12} md={6} key={result.id}>
                        <QuestionCard result={result} index={(page - 1) * pageSize + index} task={task} />
                      </Grid>
                    ))}
                  </Grid>
                )}

                {!loading && results?.length === 0 && (
                  <Box sx={{ p: 8, textAlign: 'center', color: 'text.disabled' }}>
                    <Typography>{t('evalTasks.noMatchingResults', '暂无符合条件的评估结果')}</Typography>
                  </Box>
                )}
              </Box>

              {/* 分页控制 */}
              <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', borderTop: '1px solid #eee' }}>
                <Pagination
                  count={Math.ceil(total / pageSize)}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                  showFirstButton
                  showLastButton
                />
              </Box>

              {/* 试卷底部 */}
              <Box sx={{ p: 4, textAlign: 'center', color: 'text.disabled', borderTop: '2px solid #000' }}>
                <Typography variant="caption">
                  {t('evalTasks.reportFooter', 'Easy Dataset Evaluation System · Generated by AI')}
                </Typography>
              </Box>
            </Box>
          </>
        )}
      </Container>
    </Box>
  );
}
