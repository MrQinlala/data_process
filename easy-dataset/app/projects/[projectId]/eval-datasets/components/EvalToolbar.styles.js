import { styled, alpha } from '@mui/material/styles';
import { Box, Paper, Button, ToggleButton, ToggleButtonGroup, InputBase } from '@mui/material';

export const ToolbarContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2, 2.5),
  marginBottom: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 2,
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2)
}));

export const FilterGroup = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  flexWrap: 'wrap'
}));

export const FilterButton = styled(Button, {
  shouldForwardProp: prop => prop !== 'active' && prop !== 'colorType'
})(({ theme, active, colorType }) => {
  const colorMap = {
    success: theme.palette.success,
    primary: theme.palette.primary,
    secondary: theme.palette.secondary,
    warning: theme.palette.warning,
    info: theme.palette.info
  };
  const mainColor = colorMap[colorType] || theme.palette.primary;

  return {
    padding: theme.spacing(0.75, 2),
    borderRadius: theme.shape.borderRadius * 5, // Pill shape
    border: '1px solid',
    borderColor: active ? mainColor.main : theme.palette.divider,
    backgroundColor: active ? alpha(mainColor.main, 0.1) : 'transparent',
    color: active ? mainColor.main : theme.palette.text.secondary,
    fontSize: '0.875rem',
    fontWeight: active ? 600 : 400,
    minWidth: 'auto',
    textTransform: 'none',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      backgroundColor: active ? alpha(mainColor.main, 0.15) : alpha(theme.palette.text.primary, 0.04),
      borderColor: active ? mainColor.main : theme.palette.text.secondary,
      transform: 'translateY(-1px)'
    },
    '& .MuiButton-startIcon': {
      marginRight: theme.spacing(0.8),
      color: active ? mainColor.main : theme.palette.text.disabled,
      width: 18,
      height: 18
    }
  };
});

export const SearchWrapper = styled(Paper)(({ theme }) => ({
  padding: '2px 4px',
  display: 'flex',
  alignItems: 'center',
  width: 280,
  height: 42,
  borderRadius: theme.shape.borderRadius * 1.5,
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  boxShadow: 'none',
  transition: 'all 0.2s ease',
  '&:hover': {
    borderColor: theme.palette.text.secondary,
    backgroundColor: alpha(theme.palette.action.hover, 0.05)
  },
  '&:focus-within': {
    borderColor: theme.palette.primary.main,
    boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`,
    backgroundColor: theme.palette.background.paper
  }
}));

export const StyledInputBase = styled(InputBase)(({ theme }) => ({
  marginLeft: theme.spacing(1),
  flex: 1,
  fontSize: '0.875rem',
  '& input': {
    '&::placeholder': {
      color: theme.palette.text.disabled,
      opacity: 1
    }
  }
}));

export const ActionGroup = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5)
}));

export const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 1.5,
  height: 40,
  paddingLeft: theme.spacing(3),
  paddingRight: theme.spacing(3),
  borderColor: theme.palette.divider,
  color: theme.palette.text.secondary,
  '&:hover': {
    borderColor: theme.palette.text.primary,
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.action.hover
  }
}));

export const DeleteActionButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 1.5,
  height: 40,
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  backgroundColor: alpha(theme.palette.error.main, 0.1),
  color: theme.palette.error.main,
  '&:hover': {
    backgroundColor: alpha(theme.palette.error.main, 0.2)
  }
}));

export const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  height: 40,
  backgroundColor: theme.palette.action.hover, // Slightly darker than paper
  padding: 4,
  borderRadius: theme.shape.borderRadius * 1.5,
  border: 'none',
  gap: 4,
  '& .MuiToggleButton-root': {
    border: 'none',
    borderRadius: theme.shape.borderRadius,
    width: 36,
    color: theme.palette.text.secondary,
    '&.Mui-selected': {
      backgroundColor: theme.palette.background.paper,
      color: theme.palette.primary.main,
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
      '&:hover': {
        backgroundColor: theme.palette.background.paper
      }
    },
    '&:hover': {
      backgroundColor: 'rgba(0,0,0,0.04)'
    }
  }
}));
