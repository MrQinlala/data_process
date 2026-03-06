import React from 'react';
import { Box, Card, CardContent, Grid, Typography, Stack, useTheme, alpha } from '@mui/material';
import {
  Storage as StorageIcon,
  Balance as BalanceIcon,
  Bolt as BoltIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

function StatCard({ title, value, subValue, icon: Icon, color }) {
  const theme = useTheme();

  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: theme.shadows[4],
          transform: 'translateY(-2px)'
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2} mb={2}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: alpha(color, 0.1),
              color: color,
              display: 'flex'
            }}
          >
            <Icon fontSize="medium" />
          </Box>
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            {title}
          </Typography>
        </Stack>

        <Typography variant="h3" fontWeight="bold" sx={{ mb: 1.5, color: 'text.primary' }}>
          {value}
        </Typography>

        {subValue && (
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
            {subValue}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

export default function StatsCards({ data }) {
  const theme = useTheme();
  const { t } = useTranslation();

  // 格式化数字
  const formatNumber = num => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num;
  };

  return (
    <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
      {/* 总 Token 消耗 */}
      <Box sx={{ flex: '1 1 calc(25% - 18px)', minWidth: 250 }}>
        <StatCard
          title={t('monitoring.stats.totalTokens')}
          value={formatNumber(data.totalTokens)}
          subValue={t('monitoring.stats.inputOutput', {
            input: formatNumber(data.inputTokens),
            output: formatNumber(data.outputTokens)
          })}
          icon={StorageIcon}
          color={theme.palette.primary.main}
        />
      </Box>

      {/* 平均 Token 消耗/次 */}
      <Box sx={{ flex: '1 1 calc(25% - 18px)', minWidth: 250 }}>
        <StatCard
          title={t('monitoring.stats.avgTokensPerCall')}
          value={formatNumber(data.avgTokensPerCall)}
          subValue={t('monitoring.stats.inputOutput', {
            input: formatNumber(Math.round(data.inputTokens / (data.totalCalls || 1))),
            output: formatNumber(Math.round(data.outputTokens / (data.totalCalls || 1)))
          })}
          icon={BalanceIcon}
          color={theme.palette.info.main}
        />
      </Box>

      {/* 总调用次数 */}
      <Box sx={{ flex: '1 1 calc(25% - 18px)', minWidth: 250 }}>
        <StatCard
          title={t('monitoring.stats.totalCalls')}
          value={formatNumber(data.totalCalls)}
          subValue={
            <Box component="span">
              <Box component="span" sx={{ color: theme.palette.success.main, fontWeight: 600 }}>
                {t('monitoring.stats.successCalls', { count: formatNumber(data.successCalls) })}
              </Box>
              <Box component="span" sx={{ mx: 1 }}>
                ·
              </Box>
              <Box component="span" sx={{ color: theme.palette.error.main, fontWeight: 600 }}>
                {t('monitoring.stats.failedCalls', { count: formatNumber(data.failedCalls) })}
              </Box>
              {data.totalCalls > 0 && (
                <Box component="span" sx={{ ml: 1, color: 'text.disabled' }}>
                  ({t('monitoring.stats.failureRate', { rate: ((data.failureRate || 0) * 100).toFixed(1) })})
                </Box>
              )}
            </Box>
          }
          icon={BoltIcon}
          color={theme.palette.success.main}
        />
      </Box>

      {/* 平均响应耗时 */}
      <Box sx={{ flex: '1 1 calc(25% - 18px)', minWidth: 250 }}>
        <StatCard
          title={t('monitoring.stats.avgLatency')}
          value={`${(data.avgLatency / 1000).toFixed(2)}s`}
          subValue={
            data.successCalls > 0
              ? t('monitoring.stats.basedOnSuccessCalls', { count: formatNumber(data.successCalls) })
              : t('monitoring.stats.noSuccessCalls')
          }
          icon={AccessTimeIcon}
          color={theme.palette.warning.main}
        />
      </Box>
    </Box>
  );
}
