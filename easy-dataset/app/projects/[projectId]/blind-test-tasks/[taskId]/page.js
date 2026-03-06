'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import StopIcon from '@mui/icons-material/Stop';
import { useTranslation } from 'react-i18next';

import useBlindTestDetail from '../hooks/useBlindTestDetail';
import BlindTestHeader from '../components/BlindTestHeader';
import ResultSummary from '../components/ResultSummary';
import ResultDetailList from '../components/ResultDetailList';
import BlindTestInProgress from '../components/BlindTestInProgress';

export default function BlindTestDetailPage() {
  const { projectId, taskId } = useParams();
  const router = useRouter();
  const { t } = useTranslation();

  const {
    task,
    loading,
    error,
    setError,
    currentQuestion,
    leftAnswer,
    rightAnswer,
    answersLoading,
    streamingA,
    streamingB,
    voting,
    completed,
    fetchCurrentQuestion,
    submitVote,
    interruptTask,
    getResultStats
  } = useBlindTestDetail(projectId, taskId);

  const [interruptDialog, setInterruptDialog] = useState(false);

  const handleBack = () => router.push(`/projects/${projectId}/blind-test-tasks`);

  const handleVote = async vote => {
    await submitVote(vote);
  };

  const handleInterrupt = async () => {
    await interruptTask();
    setInterruptDialog(false);
  };

  // 加载中
  if (loading) {
    return (
      <Container
        maxWidth="xl"
        sx={{ py: 3, height: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <CircularProgress />
      </Container>
    );
  }

  // 任务不存在
  if (!task) {
    return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <BlindTestHeader title={t('blindTest.taskNotFound', '任务不存在')} onBack={handleBack} />
        <Alert severity="error">{t('blindTest.taskNotFound', '任务不存在')}</Alert>
      </Container>
    );
  }

  const isResultView = completed || task.status !== 0;
  const stats = getResultStats();

  // 结果展示页面（已完成或已中断）
  if (isResultView) {
    return (
      <Container maxWidth="xl" sx={{ py: 3, height: 'calc(100vh - 64px)', overflow: 'auto' }}>
        <BlindTestHeader title={t('blindTest.resultTitle', '盲测结果')} status={task.status} onBack={handleBack} />

        <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
          <ResultSummary stats={stats} modelInfo={task.modelInfo || '{}'} />
          <ResultDetailList task={task} />
        </Box>
      </Container>
    );
  }

  // 盲测进行中页面
  return (
    <Container maxWidth="xl" sx={{ py: 3, height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
      <BlindTestHeader
        title={t('blindTest.inProgress', '盲测进行中')}
        onBack={handleBack}
        actions={
          <Button
            variant="outlined"
            color="warning"
            startIcon={<StopIcon />}
            onClick={() => setInterruptDialog(true)}
            size="small"
          >
            {t('blindTest.interrupt', '中断任务')}
          </Button>
        }
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Box sx={{ flex: 1, minHeight: 0 }}>
        <BlindTestInProgress
          task={task}
          currentQuestion={currentQuestion}
          leftAnswer={leftAnswer}
          rightAnswer={rightAnswer}
          streamingA={streamingA}
          streamingB={streamingB}
          answersLoading={answersLoading}
          voting={voting}
          onVote={handleVote}
          onReload={fetchCurrentQuestion}
        />
      </Box>

      {/* 中断确认对话框 */}
      <Dialog open={interruptDialog} onClose={() => setInterruptDialog(false)}>
        <DialogTitle>{t('blindTest.interruptConfirmTitle', '确认中断')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('blindTest.interruptConfirmMessage', '确定要中断这个盲测任务吗？已完成的评判结果将保留。')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInterruptDialog(false)}>{t('common.cancel', '取消')}</Button>
          <Button color="warning" variant="contained" onClick={handleInterrupt}>
            {t('blindTest.interrupt', '中断')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
