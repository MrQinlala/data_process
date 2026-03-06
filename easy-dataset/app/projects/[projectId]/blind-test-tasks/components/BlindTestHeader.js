import { Box, Typography, IconButton, Chip, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import { useTranslation } from 'react-i18next';
import { useTheme, alpha } from '@mui/material/styles';
import { blindTestStyles } from '@/styles/blindTest';

export default function BlindTestHeader({ title, status, onBack, actions }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = blindTestStyles(theme);

  const getStatusConfig = s => {
    switch (s) {
      case 1:
        return { label: 'blindTest.statusCompleted', color: 'success' };
      case 3:
        return { label: 'blindTest.statusInterrupted', color: 'warning' };
      default:
        return { label: 'blindTest.statusProcessing', color: 'primary' };
    }
  };

  const statusConfig = status !== undefined ? getStatusConfig(status) : null;

  return (
    <Box
      sx={{
        ...styles.header,
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
        px: 3,
        py: 2,
        mb: 3
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={onBack} size="small" sx={{ bgcolor: 'action.hover' }}>
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              p: 1,
              borderRadius: 1.5
            }}
          >
            <CompareArrowsIcon sx={{ fontSize: 24, color: 'primary.main' }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
          {statusConfig && (
            <Chip
              label={t(statusConfig.label)}
              size="small"
              sx={{
                bgcolor: alpha(theme.palette[statusConfig.color].main, 0.1),
                color: `${statusConfig.color}.main`,
                fontWeight: 600,
                border: '1px solid',
                borderColor: alpha(theme.palette[statusConfig.color].main, 0.2),
                height: 24
              }}
            />
          )}
        </Box>
      </Box>
      <Box>{actions}</Box>
    </Box>
  );
}
