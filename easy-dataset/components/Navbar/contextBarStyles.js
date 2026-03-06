/**
 * ContextBar 组件样式
 * 包含项目选择器和模型选择器的所有样式
 */

import { alpha } from '@mui/material';

// ===== 主容器样式 =====
export const getContextBarPaperStyles = theme => ({
  position: 'absolute',
  top: 64, // Below navbar
  left: 0,
  zIndex: 1100,
  borderBottom: 1,
  borderColor: 'divider',
  bgcolor:
    theme.palette.mode === 'dark'
      ? alpha(theme.palette.background.paper, 0.9)
      : alpha(theme.palette.background.paper, 0.95),
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  px: { xs: 2, sm: 3, md: 4 },
  py: { xs: 1.25, sm: 1.5 },
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  boxShadow: theme.palette.mode === 'dark' ? '0 1px 3px rgba(0, 0, 0, 0.2)' : '0 1px 3px rgba(0, 0, 0, 0.08)',
  width: 'auto'
});

export const contextBarContainerStyles = {
  display: 'flex',
  alignItems: 'center',
  gap: { xs: 1, sm: 1.5, md: 2 },
  flexWrap: 'nowrap',
  width: 'auto'
};

// ===== 选择器容器样式 =====
export const selectorContainerStyles = {
  display: 'flex',
  alignItems: 'center',
  gap: 1
};

// ===== 标签样式 =====
export const labelTypographyStyles = {
  color: 'text.secondary',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  fontSize: '0.7rem',
  display: { xs: 'none', sm: 'block' }
};

// ===== Chip 内部文本样式 =====
export const chipLabelBoxStyles = {
  display: 'flex',
  alignItems: 'center',
  gap: 0.5
};

export const chipTextStyles = {
  fontWeight: 600,
  fontSize: { xs: '0.8rem', sm: '0.875rem' },
  maxWidth: { xs: '80px', sm: '120px', md: '150px' },
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis'
};

export const chipArrowStyles = {
  ml: -0.25,
  flexShrink: 0
};

// ===== 项目选择器 Chip 样式 =====
export const getProjectChipStyles = theme => ({
  minWidth: 'auto',
  maxWidth: { xs: '120px', sm: '150px', md: '180px' },
  height: { xs: 32, sm: 36 },
  minWidth: { xs: 120, sm: 150, md: 180 },
  maxWidth: { xs: '120px', sm: '150px', md: '180px' },
  borderRadius: 1.5,
  borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    borderColor: 'primary.main',
    bgcolor: theme.palette.mode === 'dark' ? 'rgba(144, 202, 249, 0.08)' : 'rgba(25, 118, 210, 0.04)',
    transform: 'translateY(-1px)',
    boxShadow:
      theme.palette.mode === 'dark' ? '0 4px 12px rgba(144, 202, 249, 0.15)' : '0 4px 12px rgba(25, 118, 210, 0.15)'
  },
  '&:active': {
    transform: 'translateY(0)'
  },
  '&:focus-visible': {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: 2
  },
  '& .MuiChip-icon': {
    color: 'text.primary',
    fontSize: '1.1rem',
    ml: 0.5,
    flexShrink: 0
  },
  '& .MuiChip-label': {
    px: 1,
    overflow: 'hidden'
  }
});

// ===== 模型选择器 Chip 样式 =====
export const getModelChipStyles = theme => ({
  minWidth: { xs: 140, sm: 160, md: 180 },
  maxWidth: { xs: 200, sm: 280, md: 360 },
  height: { xs: 36, sm: 40 },
  borderRadius: 2,
  bgcolor: theme.palette.mode === 'dark' ? 'rgba(144, 202, 249, 0.08)' : 'rgba(25, 118, 210, 0.04)',
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    bgcolor: theme.palette.mode === 'dark' ? 'rgba(144, 202, 249, 0.15)' : 'rgba(25, 118, 210, 0.08)',
    transform: 'translateY(-1px)',
    boxShadow:
      theme.palette.mode === 'dark' ? '0 4px 12px rgba(144, 202, 249, 0.25)' : '0 4px 12px rgba(25, 118, 210, 0.25)'
  },
  '&:active': {
    transform: 'translateY(0)'
  },
  '&:focus-visible': {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: 2
  },
  '& .MuiChip-icon': {
    color: 'primary.main',
    fontSize: '1.1rem',
    ml: 0.5,
    flexShrink: 0
  },
  '& .MuiChip-label': {
    px: 1,
    overflow: 'hidden'
  }
});

// ===== 菜单样式 =====
export const getMenuPaperStyles = theme => ({
  mt: 1,
  minWidth: 240,
  maxWidth: 400,
  maxHeight: 400,
  borderRadius: 2,
  overflow: 'visible',
  bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'background.paper',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  boxShadow:
    theme.palette.mode === 'dark'
      ? '0 12px 40px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)'
      : '0 12px 40px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)',
  '&::before': {
    content: '""',
    display: 'block',
    position: 'absolute',
    top: -6,
    left: 24,
    width: 12,
    height: 12,
    bgcolor: 'background.paper',
    transform: 'translateY(-50%) rotate(45deg)',
    zIndex: 0,
    borderLeft: `1px solid ${theme.palette.divider}`,
    borderTop: `1px solid ${theme.palette.divider}`
  }
});

export const menuListPropsStyles = {
  dense: false,
  sx: { py: 1 }
};

// ===== 菜单标题样式 =====
export const menuHeaderTypographyStyles = {
  px: 2,
  py: 1,
  display: 'block',
  color: 'text.secondary',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  fontSize: '0.7rem'
};

// ===== 菜单项样式 =====
export const getMenuItemStyles = theme => ({
  mx: 1,
  borderRadius: 1.5,
  minHeight: 44,
  py: 1.25,
  px: 1.5,
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    bgcolor: theme.palette.mode === 'dark' ? 'rgba(144, 202, 249, 0.08)' : 'rgba(25, 118, 210, 0.04)',
    transform: 'translateX(4px)'
  },
  '&.Mui-selected': {
    bgcolor: theme.palette.mode === 'dark' ? 'rgba(144, 202, 249, 0.16)' : 'rgba(25, 118, 210, 0.08)',
    '&:hover': {
      bgcolor: theme.palette.mode === 'dark' ? 'rgba(144, 202, 249, 0.24)' : 'rgba(25, 118, 210, 0.12)'
    }
  }
});

export const menuItemIconStyles = {
  minWidth: 36
};

export const getMenuItemTextPrimaryProps = isSelected => ({
  variant: 'body2',
  fontWeight: isSelected ? 600 : 400
});

export const menuItemTextSecondaryProps = {
  variant: 'caption',
  sx: { fontSize: '0.7rem' }
};

// ===== 模型图标样式 =====
export const modelIconStyles = {
  width: 20,
  height: 20,
  objectFit: 'contain',
  flexShrink: 0,
  borderRadius: '50%',
  mr: 1
};

// ===== 分组标题样式 =====
export const getProviderHeaderStyles = theme => ({
  pl: 2,
  color: theme.palette.text.secondary,
  fontWeight: 600,
  fontSize: '0.75rem',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  mt: 1,
  mb: 0.5
});
