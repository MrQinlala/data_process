import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  InputAdornment,
  TablePagination,
  useTheme,
  alpha,
  Tooltip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useTranslation } from 'react-i18next';

const statusColors = {
  SUCCESS: 'success',
  FAILED: 'error'
};

export default function UsageTable({
  data,
  total,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  searchTerm,
  onSearchChange
}) {
  const theme = useTheme();
  const { t } = useTranslation();

  const handleChangePage = (event, newPage) => {
    onPageChange(newPage + 1); // MUI uses 0-indexed, our API uses 1-indexed
  };

  const handleChangeRowsPerPage = event => {
    onPageSizeChange(parseInt(event.target.value, 10));
  };

  const handleSearchChange = event => {
    onSearchChange(event.target.value);
  };

  // 直接使用传入的数据，分页和搜索已在后端完成

  return (
    <Card
      elevation={0}
      sx={{
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        mt: 3
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6" fontWeight="bold">
            {t('monitoring.table.title')}
          </Typography>
          <TextField
            size="small"
            placeholder={t('monitoring.table.searchPlaceholder')}
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              )
            }}
            sx={{ width: 300 }}
          />
        </Box>

        <TableContainer>
          <Table sx={{ minWidth: 650 }} aria-label="usage table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                  {t('monitoring.table.columns.projectName')}
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                  {t('monitoring.table.columns.provider')}
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                  {t('monitoring.table.columns.model')}
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                  {t('monitoring.table.columns.status')}
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                  {t('monitoring.table.columns.failureReason')}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                  {t('monitoring.table.columns.inputTokens')}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                  {t('monitoring.table.columns.outputTokens')}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                  {t('monitoring.table.columns.totalTokens')}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                  {t('monitoring.table.columns.calls')}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                  {t('monitoring.table.columns.avgLatency')}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row, index) => (
                <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell component="th" scope="row">
                    <Typography variant="body2" fontWeight="500">
                      {row.projectName}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={row.provider}
                      size="small"
                      sx={{
                        borderRadius: 1,
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                        fontWeight: 500
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      {row.model}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={row.status === 'SUCCESS' ? t('monitoring.status.success') : t('monitoring.status.failed')}
                      color={statusColors[row.status] || 'default'}
                      size="small"
                      variant="outlined"
                      sx={{
                        borderRadius: 1,
                        borderColor: theme.palette[statusColors[row.status]]?.main,
                        color: theme.palette[statusColors[row.status]]?.main,
                        bgcolor: alpha(theme.palette[statusColors[row.status]]?.main || '#000', 0.05)
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    {row.failureReason ? (
                      <Tooltip title={row.failureReason} arrow placement="top">
                        <Chip
                          label={
                            row.failureReason.length > 20 ? row.failureReason.slice(0, 20) + '...' : row.failureReason
                          }
                          size="small"
                          color="error"
                          variant="soft"
                          sx={{
                            maxWidth: 200,
                            bgcolor: alpha(theme.palette.error.main, 0.1),
                            color: theme.palette.error.dark,
                            cursor: 'pointer'
                          }}
                        />
                      </Tooltip>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell align="right">{row.inputTokens.toLocaleString()}</TableCell>
                  <TableCell align="right">{row.outputTokens.toLocaleString()}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    {row.totalTokens.toLocaleString()}
                  </TableCell>
                  <TableCell align="right">{row.calls}</TableCell>
                  <TableCell align="right">{row.avgLatency}</TableCell>
                </TableRow>
              ))}
              {data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 8 }}>
                    <Typography color="text.secondary">{t('monitoring.table.empty')}</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={total}
          rowsPerPage={pageSize}
          page={page - 1}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage={t('monitoring.table.rowsPerPage')}
        />
      </CardContent>
    </Card>
  );
}
