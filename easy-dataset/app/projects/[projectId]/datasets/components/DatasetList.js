'use client';

import {
  Box,
  Typography,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Divider,
  useTheme,
  alpha,
  Tooltip,
  Checkbox,
  TablePagination,
  TextField,
  Card,
  CircularProgress
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AssessmentIcon from '@mui/icons-material/Assessment';
import StarIcon from '@mui/icons-material/Star';
import { useTranslation } from 'react-i18next';
import { getRatingConfigI18n, formatScore } from '@/components/datasets/utils/ratingUtils';

// 数据集列表组件
const DatasetList = ({
  datasets,
  onViewDetails,
  onDelete,
  onEvaluate,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  total,
  selectedIds,
  onSelectAll,
  onSelectItem,
  evaluatingIds = [],
  loading = false
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const bgColor = theme.palette.mode === 'dark' ? theme.palette.primary.dark : theme.palette.primary.light;
  const color =
    theme.palette.mode === 'dark'
      ? theme.palette.getContrastText(theme.palette.primary.main)
      : theme.palette.getContrastText(theme.palette.primary.contrastText);

  const RatingChip = ({ score }) => {
    const config = getRatingConfigI18n(score, t);
    return (
      <Chip
        icon={<StarIcon sx={{ fontSize: '14px !important' }} />}
        label={`${formatScore(score)} ${config.label}`}
        size="small"
        sx={{
          backgroundColor: config.backgroundColor,
          color: config.color,
          fontWeight: 'medium',
          '& .MuiChip-icon': {
            color: config.color
          }
        }}
      />
    );
  };

  return (
    <Card elevation={2}>
      <Box sx={{ position: 'relative' }}>
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: 900 }}>
            <TableHead>
              <TableRow>
                <TableCell
                  padding="checkbox"
                  sx={{
                    backgroundColor: bgColor,
                    color: color,
                    borderBottom: `2px solid ${theme.palette.divider}`
                  }}
                >
                  <Checkbox
                    color="primary"
                    indeterminate={selectedIds.length > 0 && selectedIds.length < total}
                    checked={total > 0 && selectedIds.length === total}
                    onChange={onSelectAll}
                  />
                </TableCell>
                <TableCell
                  sx={{
                    backgroundColor: bgColor,
                    color: color,
                    fontWeight: 'bold',
                    padding: '16px 8px',
                    borderBottom: `2px solid ${theme.palette.divider}`,
                    minWidth: 200
                  }}
                >
                  {t('datasets.question')}
                </TableCell>
                <TableCell
                  sx={{
                    backgroundColor: bgColor,
                    color: color,
                    fontWeight: 'bold',
                    padding: '16px 8px',
                    borderBottom: `2px solid ${theme.palette.divider}`,
                    width: 120
                  }}
                >
                  {t('datasets.rating', '评分')}
                </TableCell>
                <TableCell
                  sx={{
                    backgroundColor: bgColor,
                    color: color,
                    fontWeight: 'bold',
                    padding: '16px 8px',
                    borderBottom: `2px solid ${theme.palette.divider}`,
                    width: 100
                  }}
                >
                  {t('datasets.model')}
                </TableCell>
                <TableCell
                  sx={{
                    backgroundColor: bgColor,
                    color: color,
                    fontWeight: 'bold',
                    padding: '16px 8px',
                    borderBottom: `2px solid ${theme.palette.divider}`,
                    width: 100
                  }}
                >
                  {t('datasets.domainTag')}
                </TableCell>
                <TableCell
                  sx={{
                    backgroundColor: bgColor,
                    color: color,
                    fontWeight: 'bold',
                    padding: '16px 8px',
                    borderBottom: `2px solid ${theme.palette.divider}`,
                    width: 120
                  }}
                >
                  {t('datasets.createdAt')}
                </TableCell>
                <TableCell
                  sx={{
                    backgroundColor: bgColor,
                    color: color,
                    fontWeight: 'bold',
                    padding: '16px 8px',
                    borderBottom: `2px solid ${theme.palette.divider}`,
                    width: 120
                  }}
                >
                  {t('common.actions')}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {datasets.map((dataset, index) => (
                <>
                  <TableRow
                    key={dataset.id}
                    sx={{
                      '&:nth-of-type(odd)': { backgroundColor: alpha(theme.palette.primary.light, 0.05) },
                      '&:hover': { backgroundColor: alpha(theme.palette.primary.light, 0.1) },
                      cursor: 'pointer'
                    }}
                    onClick={() => onViewDetails(dataset.id)}
                  >
                    <TableCell
                      padding="checkbox"
                      sx={{
                        borderLeft: `4px solid ${theme.palette.primary.main}`
                      }}
                    >
                      <Checkbox
                        color="primary"
                        checked={selectedIds.includes(dataset.id)}
                        onChange={e => {
                          e.stopPropagation();
                          onSelectItem(dataset.id);
                        }}
                        onClick={e => e.stopPropagation()}
                      />
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Box>
                        <Typography
                          variant="body2"
                          fontWeight="medium"
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            lineHeight: 1.4,
                            mb: 0.5
                          }}
                        >
                          {dataset.question}
                        </Typography>
                        {dataset.confirmed && (
                          <Chip
                            label={t('datasets.confirmed')}
                            size="small"
                            sx={{
                              backgroundColor: alpha(theme.palette.success.main, 0.1),
                              color: theme.palette.success.dark,
                              fontWeight: 'medium',
                              height: 20,
                              fontSize: '0.7rem',
                              mt: 1
                            }}
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <RatingChip score={dataset.score || 0} />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={dataset.model}
                        size="small"
                        sx={{
                          backgroundColor: alpha(theme.palette.info.main, 0.1),
                          color: theme.palette.info.dark,
                          fontWeight: 'medium',
                          maxWidth: '100%',
                          '& .MuiChip-label': {
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {dataset.questionLabel ? (
                        <Chip
                          label={dataset.questionLabel}
                          size="small"
                          sx={{
                            backgroundColor: alpha(theme.palette.primary.main, 0.1),
                            color: theme.palette.primary.dark,
                            fontWeight: 'medium',
                            maxWidth: '100%',
                            '& .MuiChip-label': {
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }
                          }}
                        />
                      ) : (
                        <Typography variant="body2" color="text.disabled" fontSize="0.75rem">
                          {t('datasets.noTag')}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary" fontSize="0.75rem">
                        {new Date(dataset.createAt).toLocaleDateString('zh-CN')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title={t('datasets.viewDetails')}>
                          <IconButton
                            size="small"
                            onClick={e => {
                              e.stopPropagation();
                              onViewDetails(dataset.id);
                            }}
                            sx={{
                              color: theme.palette.primary.main,
                              '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.1) }
                            }}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t('datasets.evaluate')}>
                          <IconButton
                            size="small"
                            disabled={evaluatingIds.includes(dataset.id)}
                            onClick={e => {
                              e.stopPropagation();
                              onEvaluate && onEvaluate(dataset);
                            }}
                            sx={{
                              color: theme.palette.secondary.main,
                              '&:hover': { backgroundColor: alpha(theme.palette.secondary.main, 0.1) }
                            }}
                          >
                            {evaluatingIds.includes(dataset.id) ? (
                              <CircularProgress size={20} sx={{ color: theme.palette.secondary.main }} />
                            ) : (
                              <AssessmentIcon fontSize="small" />
                            )}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t('common.delete')}>
                          <IconButton
                            size="small"
                            onClick={e => {
                              e.stopPropagation();
                              onDelete(dataset);
                            }}
                            sx={{
                              color: theme.palette.error.main,
                              '&:hover': { backgroundColor: alpha(theme.palette.error.main, 0.1) }
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                </>
              ))}
              {datasets.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                    <Typography variant="body1" color="text.secondary">
                      {t('datasets.noData')}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {loading && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: alpha(theme.palette.background.paper, 0.6),
              backdropFilter: 'blur(2px)',
              zIndex: 1
            }}
          >
            <CircularProgress size={32} />
            <Typography variant="body2" sx={{ mt: 1 }} color="text.secondary">
              {t('datasets.loading')}
            </Typography>
          </Box>
        )}
      </Box>
      <Divider />
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1,
          borderTop: `1px solid ${theme.palette.divider}`
        }}
      >
        <TablePagination
          component="div"
          count={total}
          page={page - 1}
          onPageChange={onPageChange}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={onRowsPerPageChange}
          labelRowsPerPage={t('datasets.rowsPerPage')}
          labelDisplayedRows={({ from, to, count }) => t('datasets.pagination', { from, to, count })}
          sx={{
            '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
              fontWeight: 'medium'
            },
            border: 'none'
          }}
        />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2">{t('common.jumpTo')}:</Typography>
          <TextField
            size="small"
            type="number"
            inputProps={{
              min: 1,
              max: Math.ceil(total / rowsPerPage),
              style: { padding: '4px 8px', width: '50px' }
            }}
            onKeyPress={e => {
              if (e.key === 'Enter') {
                const pageNum = parseInt(e.target.value, 10);
                if (pageNum >= 1 && pageNum <= Math.ceil(total / rowsPerPage)) {
                  onPageChange(null, pageNum - 1);
                  e.target.value = '';
                }
              }
            }}
          />
        </Box>
      </Box>
    </Card>
  );
};

export default DatasetList;
