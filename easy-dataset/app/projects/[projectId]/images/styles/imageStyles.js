/**
 * 图片管理页面样式配置
 */

export const imageStyles = {
  // 页面容器
  pageContainer: {
    py: 4
  },

  // 页面头部
  header: {
    mb: 4,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: 3
  },

  headerTitle: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0.5
  },

  title: {
    fontWeight: 700
  },

  subtitle: {
    color: 'text.secondary',
    fontSize: '0.875rem'
  },

  headerActions: {
    display: 'flex',
    gap: 2,
    flexWrap: 'wrap'
  },

  actionButton: {
    borderRadius: 2,
    textTransform: 'none',
    px: 3,
    fontWeight: 600,
    boxShadow: 2,
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: 4
    }
  },

  // 筛选区域
  filterCard: {
    mb: 3,
    borderRadius: 2,
    boxShadow: 1,
    border: '1px solid',
    borderColor: 'divider',
    overflow: 'visible'
  },

  filterContent: {
    display: 'flex',
    gap: 2,
    alignItems: 'center',
    flexWrap: 'wrap'
  },

  searchField: {
    minWidth: { xs: '100%', sm: 300 },
    flex: { xs: '1 1 100%', sm: '1 1 auto' },
    '& .MuiOutlinedInput-root': {
      borderRadius: 2
    }
  },

  filterSelect: {
    minWidth: { xs: '48%', sm: 150 },
    '& .MuiOutlinedInput-root': {
      borderRadius: 2
    }
  },

  viewToggle: {
    ml: 'auto',
    borderRadius: 2,
    '& .MuiToggleButton-root': {
      border: '1px solid',
      borderColor: 'divider',
      '&.Mui-selected': {
        bgcolor: 'primary.main',
        color: 'white',
        '&:hover': {
          bgcolor: 'primary.dark'
        }
      }
    }
  },

  // 图片网格
  gridContainer: {
    spacing: 3
  },

  // 图片卡片
  imageCard: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: 3,
    overflow: 'hidden',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    border: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.paper',
    '&:hover': {
      transform: 'translateY(-8px)',
      boxShadow: theme => `0 12px 24px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.15)'}`,
      borderColor: 'primary.main',
      '& .image-overlay': {
        opacity: 1
      }
    }
  },

  imageWrapper: {
    position: 'relative',
    overflow: 'hidden',
    bgcolor: 'grey.100'
  },

  imageMedia: {
    height: 220,
    objectFit: 'cover',
    transition: 'transform 0.3s ease',
    cursor: 'pointer',
    '&:hover': {
      transform: 'scale(1.05)'
    }
  },

  imageOverlay: {
    className: 'image-overlay',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background:
      'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 40%, transparent 60%, rgba(0,0,0,0.6) 100%)',
    opacity: 0,
    transition: 'opacity 0.3s ease',
    pointerEvents: 'none'
  },

  statusChipsContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
    display: 'flex',
    gap: 0.5,
    flexDirection: 'column',
    alignItems: 'flex-end',
    zIndex: 2
  },

  statusChip: {
    backdropFilter: 'blur(10px)',
    fontWeight: 600,
    fontSize: '0.75rem',
    height: 24,
    boxShadow: 2
  },

  imageNameContainer: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    display: 'flex',
    justifyContent: 'center',
    zIndex: 2
  },

  imageNameChip: {
    backdropFilter: 'blur(10px)',
    bgcolor: 'rgba(255, 255, 255, 0.95)',
    fontWeight: 600,
    maxWidth: '90%',
    boxShadow: 2,
    '& .MuiChip-label': {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  },

  cardContent: {
    flexGrow: 1,
    p: 2,
    pb: 1.5
  },

  imageName: {
    fontWeight: 600,
    fontSize: '0.9rem',
    lineHeight: 1.4
  },

  cardActions: {
    p: 2,
    pt: 0,
    gap: 1,
    mt: 2,
    display: 'flex',
    justifyContent: 'space-between'
  },

  actionIconButton: {
    transition: 'all 0.2s ease',
    '&:hover': {
      transform: 'scale(1.1)'
    }
  },

  primaryActionButton: {
    borderRadius: 2,
    textTransform: 'none',
    fontWeight: 600,
    flex: 1
  },

  // 分页
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    mt: 4
  },

  // 空状态
  emptyState: {
    textAlign: 'center',
    py: 12,
    px: 3
  },

  emptyIcon: {
    width: 120,
    height: 120,
    borderRadius: '50%',
    bgcolor: 'primary.lighter',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    mx: 'auto',
    mb: 3
  },

  emptyTitle: {
    fontWeight: 600,
    mb: 1
  },

  emptyDescription: {
    color: 'text.secondary',
    mb: 4
  },

  emptyButton: {
    borderRadius: 2,
    px: 4,
    textTransform: 'none',
    fontWeight: 600
  },

  // 加载状态
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    py: 8
  }
};
