/**
 * 评估任务页面样式
 */

export const evalTasksStyles = {
  // 页面容器
  pageContainer: {
    py: 3,
    minHeight: '100vh'
  },

  // 页头
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    mb: 3
  },

  headerTitle: {
    fontWeight: 600
  },

  headerActions: {
    display: 'flex',
    gap: 1
  },

  // 空状态
  emptyState: {
    p: 8,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 400,
    borderRadius: 3,
    bgcolor: 'background.paper'
  },

  emptyIcon: {
    fontSize: 80,
    color: 'text.disabled',
    mb: 2
  },

  emptyTitle: {
    mb: 1,
    fontWeight: 500
  },

  emptyHint: {
    mb: 4,
    textAlign: 'center',
    maxWidth: 400
  },

  // 任务卡片
  taskCard: theme => ({
    height: '100%',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    borderRadius: 2,
    overflow: 'hidden',
    border: `1px solid ${theme.palette.divider}`,
    '&:hover': {
      boxShadow: theme.shadows[6],
      transform: 'translateY(-4px)',
      borderColor: theme.palette.primary.main
    }
  }),

  taskCardContent: {
    p: 2.5
  },

  taskCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    mb: 2
  },

  taskCardModel: {
    flex: 1,
    overflow: 'hidden'
  },

  taskCardModelName: {
    fontWeight: 600,
    fontSize: '0.95rem',
    lineHeight: 1.3
  },

  taskCardTime: {
    mt: 0.5,
    fontSize: '0.75rem'
  },

  taskCardStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    mb: 2
  },

  taskCardProgress: {
    mb: 2
  },

  progressBar: {
    height: 6,
    borderRadius: 3
  },

  taskCardStats: {
    display: 'flex',
    gap: 1,
    flexWrap: 'wrap'
  },

  // 统计卡片
  statsCard: theme => ({
    height: '100%',
    borderRadius: 2,
    border: `1px solid ${theme.palette.divider}`,
    transition: 'all 0.2s ease',
    '&:hover': {
      boxShadow: theme.shadows[2]
    }
  }),

  statsCardContent: {
    p: 2.5
  },

  statsLabel: {
    fontSize: '0.75rem',
    color: 'text.secondary',
    mb: 1,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },

  statsValue: {
    fontWeight: 700,
    fontSize: '1.75rem',
    lineHeight: 1.2
  },

  // 按题型统计
  typeStatsContainer: {
    p: 2.5,
    mb: 3,
    borderRadius: 2
  },

  typeStatsTitle: {
    fontWeight: 600,
    mb: 2
  },

  typeStatsItem: theme => ({
    textAlign: 'center',
    p: 1.5,
    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
    borderRadius: 1.5,
    border: `1px solid ${theme.palette.divider}`
  }),

  typeStatsLabel: {
    fontSize: '0.7rem',
    color: 'text.secondary',
    mb: 0.5
  },

  typeStatsScore: {
    fontWeight: 700,
    fontSize: '1.1rem'
  },

  typeStatsPercent: {
    fontSize: '0.7rem',
    color: 'text.secondary'
  },

  // 结果表格
  resultsTable: {
    overflow: 'hidden',
    borderRadius: 2
  },

  resultsTableHeader: {
    fontWeight: 600,
    p: 2,
    borderBottom: 1,
    borderColor: 'divider'
  },

  resultsTableContainer: {
    maxHeight: 600
  },

  resultRow: {
    cursor: 'pointer',
    '&:hover': {
      bgcolor: 'action.hover'
    }
  },

  resultQuestion: {
    maxWidth: 400
  },

  resultScore: correct => ({
    fontWeight: 'bold',
    color: correct ? 'success.main' : 'error.main'
  }),

  resultExpandedContent: {
    py: 2.5,
    px: 1.5
  },

  resultAnswerBox: isCorrect => theme => ({
    p: 2,
    mt: 1,
    borderRadius: 1.5,
    bgcolor: isCorrect
      ? theme.palette.mode === 'dark'
        ? 'rgba(46, 125, 50, 0.15)'
        : 'rgba(46, 125, 50, 0.08)'
      : theme.palette.mode === 'dark'
        ? 'rgba(211, 47, 47, 0.15)'
        : 'rgba(211, 47, 47, 0.08)',
    border: `1px solid ${isCorrect ? theme.palette.success.main : theme.palette.error.main}`
  }),

  resultReferenceBox: {
    p: 2,
    mt: 1,
    borderRadius: 1.5,
    bgcolor: 'action.hover'
  },

  resultJudgeBox: {
    p: 2,
    mt: 1,
    borderRadius: 1.5,
    bgcolor: 'action.hover'
  },

  // 对话框
  dialogContent: {
    mt: 1
  },

  dialogSection: {
    mb: 3
  },

  dialogDivider: {
    my: 2
  },

  dialogInfoBox: theme => ({
    p: 2,
    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
    borderRadius: 1.5,
    border: `1px solid ${theme.palette.divider}`
  }),

  dialogWarning: {
    mt: 1,
    color: 'warning.main',
    fontWeight: 500
  }
};

export default evalTasksStyles;
