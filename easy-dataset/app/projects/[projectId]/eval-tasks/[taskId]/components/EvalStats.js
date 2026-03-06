'use client';

import { Box, Grid, Typography, LinearProgress } from '@mui/material';
import { detailStyles } from '../detailStyles';
import { useTranslation } from 'react-i18next';

const QUESTION_TYPE_LABELS = {
  true_false: 'eval.questionTypes.true_false',
  single_choice: 'eval.questionTypes.single_choice',
  multiple_choice: 'eval.questionTypes.multiple_choice',
  short_answer: 'eval.questionTypes.short_answer',
  open_ended: 'eval.questionTypes.open_ended'
};

export default function EvalStats({ stats, currentFilter, onFilterSelect }) {
  const { t } = useTranslation();

  if (!stats?.byType || Object.keys(stats.byType).length === 0) return null;

  return (
    <Box sx={{ mb: 4 }}>
      <Grid container spacing={2}>
        {Object.entries(stats.byType).map(([type, typeStats]) => {
          const accuracy = typeStats.total > 0 ? (typeStats.correct / typeStats.total) * 100 : 0;

          const isSelected = currentFilter === type;

          return (
            <Grid item xs={12} sm={6} md={2.4} key={type}>
              <Box
                onClick={() => onFilterSelect(isSelected ? null : type)}
                sx={{
                  ...detailStyles.typeStatsItem,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  bgcolor: isSelected ? 'primary.light' : '#fff',
                  borderColor: isSelected ? 'primary.main' : '#eee',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    borderColor: 'primary.main'
                  },
                  '& *': {
                    color: isSelected ? 'primary.contrastText' : undefined
                  }
                }}
              >
                <Typography
                  sx={{
                    ...detailStyles.typeStatsLabel,
                    color: isSelected ? 'inherit' : 'text.secondary'
                  }}
                >
                  {t(QUESTION_TYPE_LABELS[type] || type)}
                </Typography>
                <Typography
                  sx={{
                    ...detailStyles.typeStatsScore,
                    color: isSelected ? 'inherit' : 'text.primary'
                  }}
                >
                  {typeStats.correct} / {typeStats.total}
                </Typography>
                <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={accuracy}
                    sx={{
                      flex: 1,
                      height: 4,
                      borderRadius: 2,
                      bgcolor: isSelected ? 'rgba(255,255,255,0.3)' : undefined,
                      '& .MuiLinearProgress-bar': {
                        bgcolor: isSelected ? 'white' : undefined
                      }
                    }}
                    color={isSelected ? 'inherit' : accuracy >= 60 ? 'success' : 'error'}
                  />
                  <Typography
                    sx={{
                      ...detailStyles.typeStatsPercent,
                      color: isSelected ? 'inherit' : 'text.secondary'
                    }}
                  >
                    {accuracy.toFixed(0)}%
                  </Typography>
                </Box>
              </Box>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
