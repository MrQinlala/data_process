import { Box, Paper, Typography, Card, CardContent, Chip, Grid, Avatar } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { useTranslation } from 'react-i18next';
import { blindTestStyles } from '@/styles/blindTest';

export default function ResultSummary({ stats, modelInfo }) {
  const { t } = useTranslation();
  const theme = useTheme();

  if (!stats) return null;

  const totalScore = stats.modelAScore + stats.modelBScore;
  const modelAPercent = totalScore > 0 ? (stats.modelAScore / totalScore) * 100 : 50;
  const modelBPercent = totalScore > 0 ? (stats.modelBScore / totalScore) * 100 : 50;

  const winner = stats.modelAScore > stats.modelBScore ? 'A' : stats.modelBScore > stats.modelAScore ? 'B' : 'tie';

  return (
    <Paper
      elevation={0}
      sx={{
        p: 4,
        mb: 4,
        borderRadius: 4,
        border: '1px solid',
        borderColor: 'divider',
        background: `linear-gradient(180deg, ${alpha(theme.palette.background.paper, 1)} 0%, ${alpha(theme.palette.background.default, 0.5)} 100%)`
      }}
    >
      <Typography variant="h6" sx={{ mb: 4, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
        <EmojiEventsIcon color="warning" />
        {t('blindTest.resultSummary', '评测结果汇总')}
      </Typography>

      <Grid container spacing={4} alignItems="center">
        {/* Model A */}
        <Grid item xs={12} md={5}>
          <Card
            elevation={0}
            sx={{
              height: '100%',
              borderRadius: 3,
              border: '1px solid',
              borderColor: winner === 'A' ? 'primary.main' : 'divider',
              bgcolor: winner === 'A' ? alpha(theme.palette.primary.main, 0.05) : 'background.paper',
              position: 'relative',
              overflow: 'visible'
            }}
          >
            {winner === 'A' && (
              <Box
                sx={{
                  position: 'absolute',
                  top: -12,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  bgcolor: 'primary.main',
                  color: 'white',
                  px: 2,
                  py: 0.5,
                  borderRadius: 10,
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  boxShadow: 2
                }}
              >
                WINNER
              </Box>
            )}
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  bgcolor: 'primary.main',
                  mb: 2,
                  mx: 'auto',
                  fontSize: '1.25rem'
                }}
              >
                A
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }} noWrap>
                {modelInfo?.modelA?.modelName || 'Model A'}
              </Typography>
              <Chip
                label={modelInfo?.modelA?.providerName}
                size="small"
                sx={{ mb: 2, bgcolor: 'background.default' }}
              />

              <Box sx={{ mb: 2 }}>
                <Typography variant="h3" color="primary.main" sx={{ fontWeight: 800 }}>
                  {stats.modelAScore.toFixed(1)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t('blindTest.wins', '胜出')}: {stats.modelAWins}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* VS / Progress */}
        <Grid item xs={12} md={2}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" color="text.disabled" sx={{ fontWeight: 900, opacity: 0.2, mb: 2 }}>
              VS
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden', width: '100%' }}>
                <Box
                  sx={{
                    width: `${modelAPercent}%`,
                    bgcolor: 'primary.main',
                    transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                />
                <Box
                  sx={{
                    width: `${modelBPercent}%`,
                    bgcolor: 'secondary.main',
                    transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                />
              </Box>
            </Box>
          </Box>
        </Grid>

        {/* Model B */}
        <Grid item xs={12} md={5}>
          <Card
            elevation={0}
            sx={{
              height: '100%',
              borderRadius: 3,
              border: '1px solid',
              borderColor: winner === 'B' ? 'secondary.main' : 'divider',
              bgcolor: winner === 'B' ? alpha(theme.palette.secondary.main, 0.05) : 'background.paper',
              position: 'relative',
              overflow: 'visible'
            }}
          >
            {winner === 'B' && (
              <Box
                sx={{
                  position: 'absolute',
                  top: -12,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  bgcolor: 'secondary.main',
                  color: 'white',
                  px: 2,
                  py: 0.5,
                  borderRadius: 10,
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  boxShadow: 2
                }}
              >
                WINNER
              </Box>
            )}
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  bgcolor: 'secondary.main',
                  mb: 2,
                  mx: 'auto',
                  fontSize: '1.25rem'
                }}
              >
                B
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }} noWrap>
                {modelInfo?.modelB?.modelName || 'Model B'}
              </Typography>
              <Chip
                label={modelInfo?.modelB?.providerName}
                size="small"
                sx={{ mb: 2, bgcolor: 'background.default' }}
              />

              <Box sx={{ mb: 2 }}>
                <Typography variant="h3" color="secondary.main" sx={{ fontWeight: 800 }}>
                  {stats.modelBScore.toFixed(1)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t('blindTest.wins', '胜出')}: {stats.modelBWins}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 底部统计条 */}
      <Box
        sx={{
          mt: 4,
          p: 3,
          borderRadius: 3,
          bgcolor: 'background.default',
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Grid container spacing={2} justifyContent="center" alignItems="center">
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                {stats.totalQuestions}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('blindTest.totalQuestions', '总题数')}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h5" color="success.main" sx={{ fontWeight: 700, mb: 0.5 }}>
                {stats.bothGood}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('blindTest.bothGood', '都好')}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h5" color="error.main" sx={{ fontWeight: 700, mb: 0.5 }}>
                {stats.bothBad}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('blindTest.bothBad', '都不好')}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h5" color="text.secondary" sx={{ fontWeight: 700, mb: 0.5 }}>
                {stats.ties}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('blindTest.ties', '平局')}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
}
