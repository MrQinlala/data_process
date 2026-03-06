'use client';

import { Box, Button, Divider, Typography, IconButton, Paper, Tooltip } from '@mui/material';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';

export default function EvalDatasetHeader({ projectId, onNavigate, onDelete }) {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            startIcon={<NavigateBeforeIcon />}
            onClick={() => router.push(`/projects/${projectId}/eval-datasets`)}
          >
            {t('common.backToList')}
          </Button>
          <Divider orientation="vertical" flexItem />
          <Typography variant="h6">{t('eval.detail')}</Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <IconButton onClick={() => onNavigate('prev')} title={t('common.prev')}>
            <NavigateBeforeIcon />
          </IconButton>
          <IconButton onClick={() => onNavigate('next')} title={t('common.next')}>
            <NavigateNextIcon />
          </IconButton>
          <Divider orientation="vertical" flexItem />

          <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={onDelete}>
            {t('common.delete')}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}
