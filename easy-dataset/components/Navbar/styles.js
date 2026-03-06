/**
 * Navbar 组件样式配置
 */

// AppBar 样式
export const getAppBarStyles = theme => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'primary.main',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  boxShadow: theme.palette.mode === 'dark' ? '0 1px 3px rgba(0, 0, 0, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.1)'
});

// Toolbar 样式
export const toolbarStyles = {
  height: '64px',
  minHeight: '64px !important',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  px: { xs: 2, sm: 2, md: 3 },
  gap: 2
};

// Logo 容器样式
export const logoContainerStyles = {
  display: 'flex',
  alignItems: 'center',
  gap: 1.5,
  flexShrink: 0
};

// 汉堡菜单按钮样式
export const getHamburgerButtonStyles = theme => ({
  color: theme.palette.mode === 'dark' ? 'inherit' : 'white',
  minWidth: 44,
  minHeight: 44,
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'scale(1.1)',
    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.15)'
  },
  '&:active': {
    transform: 'scale(0.95)'
  },
  '&:focus-visible': {
    outline: `2px solid ${theme.palette.mode === 'dark' ? theme.palette.secondary.main : 'white'}`,
    outlineOffset: 2
  }
});

// Logo 链接样式
export const getLogoLinkStyles = theme => ({
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
  textDecoration: 'none',
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  borderRadius: 1.5,
  px: 0.5,
  '&:hover': {
    opacity: 0.85,
    transform: 'translateY(-1px)'
  },
  '&:active': {
    transform: 'translateY(0)'
  },
  '&:focus-visible': {
    outline: `2px solid ${theme.palette.mode === 'dark' ? theme.palette.secondary.main : 'white'}`,
    outlineOffset: 2
  }
});

// Logo 图片样式
export const logoImageStyles = {
  width: 32,
  height: 32,
  mr: 1.5,
  transition: 'transform 0.2s ease'
};

// Logo 文字样式
export const getLogoTextStyles = theme => ({
  fontWeight: 700,
  letterSpacing: '-0.5px',
  fontSize: '1.125rem',
  display: { xs: 'none', md: 'block' },
  color: 'white',
  ...(theme.palette.mode === 'dark' && {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  })
});

// 中间导航容器样式
export const navContainerStyles = {
  flexGrow: 1,
  display: 'flex',
  justifyContent: 'center',
  mx: { lg: 1, xl: 3 },
  overflow: 'hidden'
};

// Tabs 样式
export const getTabsStyles = theme => ({
  minHeight: '64px',
  '& .MuiTab-root': {
    minWidth: 100,
    maxWidth: 180,
    fontSize: '0.875rem',
    fontWeight: 500,
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 1)',
    px: 2,
    minHeight: '64px',
    textTransform: 'none',
    letterSpacing: '0.3px',
    '&:hover': {
      color: 'white',
      bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.15)'
    }
  },
  '& .Mui-selected': {
    color: 'white !important',
    fontWeight: 600,
    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.2)'
  },
  '& .MuiTabs-indicator': {
    height: 3,
    borderRadius: '3px 3px 0 0',
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.secondary.main : 'white',
    boxShadow: theme.palette.mode === 'dark' ? '0 0 8px rgba(103, 126, 234, 0.5)' : '0 0 8px rgba(255, 255, 255, 0.5)'
  }
});

// Tab 图标包装器样式
export const tabIconWrapperStyles = {
  '& .MuiTab-iconWrapper': { mr: 1 }
};

// 右侧操作区容器样式
export const actionAreaStyles = {
  display: 'flex',
  alignItems: 'center',
  gap: 1,
  flexShrink: 0
};

// 文档/GitHub 按钮样式
export const getIconButtonStyles = theme => ({
  display: { xs: 'none', xl: 'flex' },
  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.2)',
  color: theme.palette.mode === 'dark' ? 'inherit' : 'white',
  borderRadius: 1.5,
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.35)'
  },
  '&:focus-visible': {
    outline: `2px solid ${theme.palette.mode === 'dark' ? theme.palette.secondary.main : 'white'}`,
    outlineOffset: 2
  }
});

// Drawer Paper 样式
export const getDrawerPaperStyles = theme => ({
  width: { xs: '85vw', sm: 320 },
  maxWidth: 380,
  bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'background.default',
  backgroundImage:
    theme.palette.mode === 'dark' ? 'linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05))' : 'none',
  boxShadow: theme.palette.mode === 'dark' ? '0 8px 32px rgba(0, 0, 0, 0.6)' : '0 8px 32px rgba(0, 0, 0, 0.15)'
});

// Drawer 头部样式
export const getDrawerHeaderStyles = theme => ({
  p: 2.5,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderBottom: `1px solid ${theme.palette.divider}`,
  minHeight: 64
});

// Drawer 关闭按钮样式
export const getDrawerCloseButtonStyles = theme => ({
  minWidth: 44,
  minHeight: 44,
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'rotate(90deg)',
    bgcolor: 'action.hover'
  },
  '&:focus-visible': {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: 2
  }
});

// Drawer 列表样式
export const drawerListStyles = {
  pt: 1,
  px: 1
};

// Drawer 列表项按钮样式
export const getDrawerListItemButtonStyles = theme => ({
  borderRadius: '8px',
  minHeight: 48,
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    bgcolor: theme.palette.mode === 'dark' ? 'rgba(103, 126, 234, 0.12)' : 'rgba(103, 126, 234, 0.08)'
  },
  '&:focus-visible': {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: -2
  }
});

// Drawer 子菜单容器样式
export const getDrawerSubmenuContainerStyles = theme => ({
  bgcolor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.02)',
  borderRadius: '8px',
  my: 0.5
});

// Drawer 子菜单项样式
export const getDrawerSubmenuItemStyles = theme => ({
  pl: 4,
  mx: 1,
  borderRadius: '8px',
  minHeight: 44,
  py: 1.5,
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    bgcolor: theme.palette.mode === 'dark' ? 'rgba(103, 126, 234, 0.08)' : 'rgba(103, 126, 234, 0.05)'
  },
  '&:focus-visible': {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: -2
  }
});

// Drawer 工具区域样式
export const getDrawerUtilitiesStyles = theme => ({
  mt: 'auto',
  pt: 2,
  borderTop: `1px solid ${theme.palette.divider}`
});

// Menu Paper 样式
export const getMenuPaperStyles = theme => ({
  mt: 1.5,
  borderRadius: '12px',
  minWidth: 220,
  overflow: 'visible',
  bgcolor: theme.palette.mode === 'dark' ? 'rgba(30, 30, 30, 0.98)' : 'rgba(255, 255, 255, 0.98)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  boxShadow:
    theme.palette.mode === 'dark'
      ? '0 12px 40px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.1)'
      : '0 12px 40px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.05)',
  '&::before': {
    content: '""',
    display: 'block',
    position: 'absolute',
    top: 0,
    right: '50%',
    width: 12,
    height: 12,
    bgcolor: theme.palette.mode === 'dark' ? 'rgba(30, 30, 30, 0.98)' : 'rgba(255, 255, 255, 0.98)',
    transform: 'translateY(-50%) translateX(50%) rotate(45deg)',
    zIndex: 0,
    boxShadow: theme.palette.mode === 'dark' ? '-2px -2px 4px rgba(0, 0, 0, 0.3)' : '-2px -2px 4px rgba(0, 0, 0, 0.1)'
  }
});

// Menu 列表样式
export const menuListStyles = {
  py: 1.5
};

// Menu 项样式
export const getMenuItemStyles = theme => ({
  mx: 1,
  borderRadius: '8px',
  py: 1.25,
  minHeight: 44,
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    bgcolor: theme.palette.mode === 'dark' ? 'rgba(103, 126, 234, 0.15)' : 'rgba(103, 126, 234, 0.1)',
    transform: 'translateX(4px)'
  },
  '&:focus-visible': {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: -2
  }
});

// Dataset/More Menu Paper 样式（简化版）
export const getSimpleMenuPaperStyles = theme => ({
  mt: 1.5,
  borderRadius: '12px',
  minWidth: 220,
  overflow: 'visible',
  bgcolor: theme.palette.mode === 'dark' ? 'rgba(30, 30, 30, 0.98)' : 'rgba(255, 255, 255, 0.98)',
  backdropFilter: 'blur(20px)',
  boxShadow:
    theme.palette.mode === 'dark'
      ? '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)'
      : '0 8px 32px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)',
  '&::before': {
    content: '""',
    display: 'block',
    position: 'absolute',
    top: 0,
    right: '50%',
    width: 12,
    height: 12,
    bgcolor: theme.palette.mode === 'dark' ? 'rgba(30, 30, 30, 0.98)' : 'rgba(255, 255, 255, 0.98)',
    transform: 'translateY(-50%) translateX(50%) rotate(45deg)',
    zIndex: 0
  }
});

// 简化 Menu 列表样式
export const simpleMenuListStyles = {
  py: 1
};

// 简化 Menu 项样式
export const getSimpleMenuItemStyles = theme => ({
  mx: 0.75,
  borderRadius: '8px',
  py: 1,
  transition: 'all 0.15s ease',
  '&:hover': {
    bgcolor: theme.palette.mode === 'dark' ? 'rgba(103, 126, 234, 0.15)' : 'rgba(103, 126, 234, 0.1)',
    transform: 'translateX(4px)'
  }
});

// ListItemIcon 样式
export const listItemIconStyles = {
  minWidth: 40
};

export const smallListItemIconStyles = {
  minWidth: 36
};

// ListItemText 样式
export const listItemTextStyles = {
  fontWeight: 600,
  fontSize: '0.95rem'
};

export const smallListItemTextStyles = {
  fontSize: '0.9rem',
  fontWeight: 500
};

// 图标颜色样式
export const getIconColorStyles = theme => ({
  color: theme.palette.mode === 'dark' ? 'primary.light' : 'primary.main'
});

export const getPrimaryIconColorStyles = theme => ({
  color: theme.palette.primary.main
});
