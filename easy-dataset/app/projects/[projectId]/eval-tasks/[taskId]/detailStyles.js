export const detailStyles = {
  // 页面背景
  pageContainer: {
    py: 4,
    minHeight: '100vh',
    bgcolor: '#f5f7fa'
  },

  // 头部概览卡片
  headerCard: {
    mb: 3,
    borderRadius: 3,
    overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
    border: 'none'
  },

  headerContent: {
    p: 3,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 2
  },

  // 分数印章效果
  scoreStamp: (score, isPass) => ({
    width: 110,
    height: 110,
    borderRadius: '50%',
    border: `4px double ${isPass ? '#2e7d32' : '#d32f2f'}`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: isPass ? '#2e7d32' : '#d32f2f',
    transform: 'rotate(-15deg)',
    maskImage:
      'url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZmlsdGVyIGlkPSJub2lzZSI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuNSIgbnVtT2N0YXZlcz0iMyIgc3RpdGNoVGlsZXM9InN0aXRjaCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNub2lzZSkiIG9wYWNpdHk9IjAuNSIvPjwvc3ZnPg==")', // 简单的噪点遮罩模拟印章纹理（可选）
    opacity: 0.9,
    boxShadow: 'inset 0 0 10px rgba(0,0,0,0.1)',
    flexShrink: 0
  }),

  scoreValue: {
    fontSize: '2.2rem',
    fontWeight: 900,
    lineHeight: 1.1,
    fontFamily: '"Comic Sans MS", "Chalkboard SE", sans-serif',
    mb: 0.2
  },

  scoreLabel: {
    fontSize: '0.75rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 1
  },

  // 统计卡片
  statBox: {
    textAlign: 'center',
    p: 2,
    borderRadius: 2,
    bgcolor: 'background.default',
    minWidth: 100
  },

  // 试卷主体
  paperContainer: {
    width: '100%',
    mx: 'auto',
    bgcolor: '#fff',
    boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
    borderRadius: 2,
    overflow: 'hidden',
    position: 'relative',
    border: '1px solid #e0e0e0'
  },

  paperHeader: {
    p: 4,
    borderBottom: '2px solid #000',
    textAlign: 'center',
    position: 'relative',
    bgcolor: '#fff'
  },

  paperTitle: {
    fontSize: '1.75rem',
    fontWeight: 700,
    mb: 1,
    fontFamily: '"Songti SC", "SimSun", serif' // 宋体增强试卷感
  },

  paperSubTitle: {
    color: 'text.secondary',
    fontSize: '0.9rem'
  },

  // 题目部分
  questionSection: {
    p: 0
  },

  questionCard: isCorrect => ({
    p: 3,
    height: '100%', // 确保在Grid中高度撑满
    borderBottom: '1px solid #f0f0f0', // 减淡边框颜色
    position: 'relative',
    transition: 'all 0.2s ease',
    '&:hover': {
      bgcolor: '#fafafa'
    }
  }),

  questionIndex: {
    position: 'absolute',
    left: 20,
    top: 24,
    width: 32,
    height: 32,
    borderRadius: '50%', // 圆形题号
    border: '1px solid #ddd',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    color: 'text.secondary',
    bgcolor: '#fff',
    zIndex: 1,
    fontSize: '0.875rem'
  },

  // 判卷标记（红勾/红叉）
  markIcon: isCorrect => ({
    position: 'absolute',
    right: 20,
    top: 20,
    fontSize: '3rem',
    color: isCorrect ? '#2e7d32' : '#d32f2f',
    opacity: 0.8,
    transform: 'rotate(10deg)',
    fontFamily: '"Comic Sans MS", "Chalkboard SE", sans-serif'
  }),

  // 题目内容
  questionContent: {
    fontSize: '1.1rem',
    fontWeight: 500,
    lineHeight: 1.6,
    mb: 2,
    color: '#333'
  },

  // 选项区域
  optionsContainer: {
    pl: 2,
    mb: 2
  },

  optionItem: (isSelected, isCorrectOption) => ({
    p: 1,
    mb: 0.5,
    borderRadius: 1,
    bgcolor: isCorrectOption
      ? 'rgba(46, 125, 50, 0.1)' // 正确选项显示绿色背景
      : isSelected
        ? 'rgba(211, 47, 47, 0.1)'
        : 'transparent', // 错误选中显示红色背景
    color: isCorrectOption ? 'success.main' : isSelected ? 'error.main' : 'text.primary',
    display: 'flex',
    alignItems: 'flex-start',
    gap: 1
  }),

  // 答案区域
  answerSection: {
    mt: 2,
    p: 2,
    bgcolor: '#f8f9fa',
    borderRadius: 2,
    borderLeft: '4px solid #ddd',
    position: 'relative'
  },

  // Markdown 展示区域
  markdownContainer: isExpanded => ({
    maxHeight: isExpanded ? 'none' : '200px',
    overflow: 'hidden',
    position: 'relative',
    '& .markdown-body': {
      fontSize: '0.9rem',
      lineHeight: 1.6,
      bgcolor: 'transparent',
      color: 'inherit',
      padding: 0
    }
  }),

  // 展开收起遮罩层（渐变效果）
  expandMask: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60px',
    background: 'linear-gradient(transparent, #f8f9fa)',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    pb: 1,
    zIndex: 1
  },

  expandButton: {
    fontSize: '0.75rem',
    textTransform: 'none',
    color: 'primary.main',
    bgcolor: 'rgba(255,255,255,0.8)',
    '&:hover': {
      bgcolor: 'rgba(255,255,255,1)'
    },
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    borderRadius: '16px',
    px: 2
  },

  // 教师点评样式
  judgeComment: {
    mt: 2,
    position: 'relative',
    fontFamily: '"KaiTi", "KaiTi_GB2312", serif', // 楷体模拟手写点评
    color: '#d32f2f',
    padding: '10px 20px',
    border: '1px solid #d32f2f',
    borderRadius: '20px 20px 20px 4px', // 气泡形状
    maxWidth: 'fit-content',
    bgcolor: '#fff5f5'
  },

  judgeLabel: {
    fontSize: '0.8rem',
    opacity: 0.7,
    fontStyle: 'italic',
    mb: 0.5
  },

  // 按题型统计样式
  typeStatsItem: {
    textAlign: 'center',
    p: 2,
    bgcolor: '#fff',
    borderRadius: 2,
    border: '1px solid #eee',
    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center'
  },

  typeStatsLabel: {
    fontSize: '0.85rem',
    color: 'text.secondary',
    mb: 1
  },

  typeStatsScore: {
    fontWeight: 700,
    fontSize: '1.25rem',
    color: 'text.primary'
  },

  typeStatsPercent: {
    fontSize: '0.75rem',
    color: 'text.secondary',
    fontWeight: 500
  }
};
