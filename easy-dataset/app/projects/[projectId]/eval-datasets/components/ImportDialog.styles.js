import { styled, alpha } from '@mui/material/styles';
import { Box, Paper, DialogTitle as MuiDialogTitle, RadioGroup, FormControlLabel } from '@mui/material';

export const StyledDialogTitle = styled(MuiDialogTitle)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(2, 3),
  borderBottom: `1px solid ${theme.palette.divider}`,
  '& .MuiTypography-root': {
    fontWeight: 600,
    fontSize: '1.1rem'
  }
}));

export const TypeRadioGroup = styled(RadioGroup)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  gap: theme.spacing(2)
}));

export const TypeFormControlLabel = styled(FormControlLabel, {
  shouldForwardProp: prop => prop !== 'checked'
})(({ theme, checked }) => ({
  margin: 0,
  padding: '4px 12px',
  borderRadius: '8px',
  border: '1px solid',
  borderColor: checked ? theme.palette.primary.main : theme.palette.divider,
  backgroundColor: checked ? alpha(theme.palette.primary.main, 0.05) : 'transparent',
  transition: 'all 0.2s',
  '&:hover': {
    backgroundColor: checked ? alpha(theme.palette.primary.main, 0.08) : theme.palette.action.hover
  },
  '& .MuiTypography-root': {
    fontSize: '0.875rem',
    color: checked ? theme.palette.primary.main : theme.palette.text.primary,
    fontWeight: checked ? 600 : 400
  },
  '& .MuiRadio-root': {
    padding: '4px',
    color: checked ? theme.palette.primary.main : theme.palette.text.secondary
  }
}));

export const UploadBox = styled(Box, {
  shouldForwardProp: prop => prop !== 'active' && prop !== 'hasFile'
})(({ theme, active, hasFile }) => ({
  border: '2px dashed',
  borderColor: active ? theme.palette.primary.main : theme.palette.grey[300],
  borderRadius: theme.shape.borderRadius * 2,
  padding: theme.spacing(4),
  textAlign: 'center',
  cursor: 'pointer',
  backgroundColor: active
    ? alpha(theme.palette.primary.main, 0.05)
    : hasFile
      ? alpha(theme.palette.primary.main, 0.05)
      : 'transparent',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: alpha(theme.palette.primary.main, 0.02),
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
  },
  '& svg': {
    fontSize: 48,
    marginBottom: theme.spacing(1),
    color: active ? theme.palette.primary.main : theme.palette.grey[400],
    transition: 'color 0.3s ease'
  }
}));

export const PreviewPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2.5),
  marginBottom: theme.spacing(3),
  backgroundColor: theme.palette.grey[50],
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius * 1.5,
  '& .title': {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    marginBottom: theme.spacing(1.5),
    color: theme.palette.text.primary,
    fontWeight: 600
  }
}));

export const CodeBlock = styled(Box)(({ theme }) => ({
  backgroundColor: '#1e1e1e', // Dark theme for code
  color: '#d4d4d4',
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  fontFamily: '"Fira Code", "Roboto Mono", monospace',
  fontSize: '0.85rem',
  overflow: 'auto',
  maxHeight: 300,
  '&::-webkit-scrollbar': {
    height: 8,
    width: 8
  },
  '&::-webkit-scrollbar-track': {
    backgroundColor: '#2d2d2d'
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: '#555',
    borderRadius: 4
  }
}));

export const ErrorContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(1),
  fontSize: '0.85rem',
  maxHeight: 200,
  overflowY: 'auto',
  '& .item': {
    padding: theme.spacing(0.5, 0),
    color: theme.palette.error.main,
    display: 'flex',
    alignItems: 'flex-start',
    gap: theme.spacing(1),
    '&::before': {
      content: '"•"',
      fontWeight: 'bold'
    }
  }
}));

export const TagInputWrapper = styled(Box)(({ theme }) => ({
  // Custom styles for tag input area if needed
}));
