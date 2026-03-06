// styles/home.js
import { alpha } from '@mui/material/styles';

export const styles = {
  heroSection: {
    pt: { xs: 6, md: 10 },
    pb: { xs: 6, md: 8 },
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.3s ease-in-out'
  },
  heroBackground: theme => ({
    background:
      theme.palette.mode === 'dark'
        ? 'linear-gradient(135deg, rgba(42, 92, 170, 0.25) 0%, rgba(139, 92, 246, 0.25) 100%)'
        : 'linear-gradient(135deg, rgba(42, 92, 170, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%)',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'url("/imgs/grid-pattern.png") repeat',
      opacity: theme.palette.mode === 'dark' ? 0.05 : 0.03,
      zIndex: 0
    }
  }),
  decorativeCircle: {
    position: 'absolute',
    width: '800px',
    height: '800px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, rgba(42, 92, 170, 0) 70%)',
    top: '-300px',
    right: '-200px',
    zIndex: 0,
    animation: 'pulse 15s infinite ease-in-out',
    '@keyframes pulse': {
      '0%': { transform: 'scale(1)' },
      '50%': { transform: 'scale(1.05)' },
      '100%': { transform: 'scale(1)' }
    }
  },
  decorativeCircleSecond: {
    position: 'absolute',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(42, 92, 170, 0.1) 0%, rgba(139, 92, 246, 0) 70%)',
    bottom: '-200px',
    left: '-100px',
    zIndex: 0,
    animation: 'pulse2 20s infinite ease-in-out',
    '@keyframes pulse2': {
      '0%': { transform: 'scale(1)' },
      '50%': { transform: 'scale(1.08)' },
      '100%': { transform: 'scale(1)' }
    }
  },
  gradientTitle: theme => ({
    mb: 2,
    background: theme.palette.gradient.primary,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    textFillColor: 'transparent'
  }),
  createButton: theme => ({
    mt: 3,
    px: 4,
    py: 1.2,
    borderRadius: '12px',
    fontSize: '1rem',
    background: theme.palette.gradient.primary,
    '&:hover': {
      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)'
    }
  }),
  statsCard: theme => ({
    mt: 6,
    p: { xs: 2, md: 4 },
    borderRadius: '16px',
    boxShadow: theme.palette.mode === 'dark' ? '0 8px 24px rgba(0, 0, 0, 0.2)' : '0 8px 24px rgba(0, 0, 0, 0.05)',
    background: theme.palette.mode === 'dark' ? 'rgba(30, 30, 30, 0.6)' : 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(8px)'
  }),
  projectCard: theme => ({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    borderRadius: '16px',
    overflow: 'visible', // 允许内容溢出（如下拉菜单）
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: theme.palette.mode === 'dark' ? '0 12px 24px rgba(0,0,0,0.3)' : '0 12px 24px rgba(0,0,0,0.1)'
    }
  }),
  projectCardContent: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    p: 2
  },
  projectTitle: {
    fontWeight: 700,
    fontSize: '1rem',
    lineHeight: 1.2,
    mb: 0.25,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  projectDescription: {
    mb: 1.5,
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: 2,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    height: '32px',
    color: 'text.secondary',
    fontSize: '0.75rem',
    lineHeight: 1.4
  },
  statsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 1,
    mt: 'auto'
  },
  statItem: theme => ({
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    p: 0.75,
    borderRadius: '8px',
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
    transition: 'background-color 0.2s',
    '&:hover': {
      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)'
    }
  }),
  statIconBox: (theme, color) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24,
    borderRadius: '6px',
    backgroundColor: alpha(theme.palette[color].main, 0.1),
    color: theme.palette[color].main
  }),
  cardFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    mt: 2,
    pt: 2,
    borderTop: '1px solid',
    borderColor: 'divider'
  }
};
