import React from 'react';
import { Card, CardContent, Typography, Box, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

export default function Charts({ trendData, modelDistribution }) {
  const theme = useTheme();
  const { t } = useTranslation();

  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
    theme.palette.info.main
  ];

  return (
    <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
      {/* 趋势图 */}
      <Box sx={{ flex: '1 1 calc(66.67% - 16px)', minWidth: 500 }}>
        <Card
          elevation={0}
          sx={{
            height: 400,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 2
          }}
        >
          <CardContent sx={{ height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight="bold">
                {t('monitoring.charts.tokenTrend')}
              </Typography>
              <Box display="flex" gap={2}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: theme.palette.primary.main }} />
                  <Typography variant="caption" color="text.secondary">
                    {t('monitoring.charts.inputLegend')}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: theme.palette.success.main }} />
                  <Typography variant="caption" color="text.secondary">
                    {t('monitoring.charts.outputLegend')}
                  </Typography>
                </Box>
              </Box>
            </Box>

            <ResponsiveContainer width="100%" height="85%">
              <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorInput" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.1} />
                    <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorOutput" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={theme.palette.success.main} stopOpacity={0.1} />
                    <stop offset="95%" stopColor={theme.palette.success.main} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                  dy={10}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 8
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="input"
                  stroke={theme.palette.primary.main}
                  fillOpacity={1}
                  fill="url(#colorInput)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="output"
                  stroke={theme.palette.success.main}
                  fillOpacity={1}
                  fill="url(#colorOutput)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Box>

      {/* 模型分布图 */}
      <Box sx={{ flex: '1 1 calc(33.33% - 16px)', minWidth: 350 }}>
        <Card
          elevation={0}
          sx={{
            height: 400,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 2
          }}
        >
          <CardContent sx={{ height: '100%' }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              {t('monitoring.charts.distributionTitle')}
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={4}>
              {t('monitoring.charts.distributionSubtitle')}
            </Typography>

            <Box sx={{ height: '70%', position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={modelDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {modelDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={value => t('monitoring.charts.tokensTooltip', { value: (value / 1000).toFixed(1) })}
                    contentStyle={{
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 8
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value, entry, index) => (
                      <span style={{ color: theme.palette.text.primary, fontSize: 12, marginLeft: 5 }}>{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* 中间文字 */}
              {/* <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center'
                }}
              >
                <Typography variant="h5" fontWeight="bold">
                  {modelDistribution.length}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Models
                </Typography>
              </Box> */}
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
