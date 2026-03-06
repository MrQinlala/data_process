'use client';

import { Backdrop, Paper, CircularProgress, Typography, Box, LinearProgress } from '@mui/material';

export default function LoadingBackdrop({ open, title, description, progress = null }) {
  return (
    <Backdrop
      sx={{
        color: '#fff',
        zIndex: theme => theme.zIndex.drawer + 1,
        position: 'fixed',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      open={open}
    >
      <Paper
        elevation={4}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 4,
          borderRadius: 3,
          bgcolor: 'background.paper',
          minWidth: 280,
          maxWidth: '90%',
          textAlign: 'center',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          border: '1px solid rgba(0, 0, 0, 0.05)'
        }}
      >
        <CircularProgress
          size={48}
          thickness={4}
          sx={{
            mb: 3,
            color: theme => theme.palette.primary.main
          }}
        />

        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            mb: 1,
            textAlign: 'center',
            width: '100%'
          }}
        >
          {title}
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          sx={{
            mb: 2,
            textAlign: 'center',
            width: '100%',
            mx: 'auto'
          }}
        >
          {description}
        </Typography>

        {progress && progress.total > 0 && (
          <Box sx={{ width: '100%', mt: 2 }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                mb: 1.5
              }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  textAlign: 'center',
                  mb: 0.5
                }}
              >
                {progress.completed}/{progress.total} ({progress.percentage}%)
              </Typography>

              {progress.questionCount > 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                  已生成问题数: {progress.questionCount}
                </Typography>
              )}
            </Box>

            <LinearProgress
              variant="determinate"
              value={progress.percentage}
              sx={{
                height: 6,
                borderRadius: 3,
                '& .MuiLinearProgress-bar': {
                  borderRadius: 3
                }
              }}
            />
          </Box>
        )}
      </Paper>
    </Backdrop>
  );
}
