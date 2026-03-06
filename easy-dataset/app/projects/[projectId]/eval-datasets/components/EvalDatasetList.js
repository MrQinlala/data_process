'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  IconButton,
  Chip,
  Typography,
  Tooltip,
  Box
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useTranslation } from 'react-i18next';

export default function EvalDatasetList({ items, selectedIds, onSelect, onSelectAll, onEdit, onDelete, onView }) {
  const { t } = useTranslation();

  const isAllSelected = items.length > 0 && selectedIds.length === items.length;
  const isIndeterminate = selectedIds.length > 0 && selectedIds.length < items.length;

  // 题型颜色映射
  const getTypeColor = type => {
    const colors = {
      true_false: 'success',
      single_choice: 'primary',
      multiple_choice: 'secondary',
      short_answer: 'warning',
      open_ended: 'info'
    };
    return colors[type] || 'default';
  };

  // 格式化答案显示
  const formatAnswer = item => {
    const { questionType, correctAnswer, options } = item;

    if (questionType === 'true_false') {
      return correctAnswer;
    }

    if (questionType === 'single_choice' || questionType === 'multiple_choice') {
      return correctAnswer;
    }

    // 非选择题，截断显示
    if (correctAnswer && correctAnswer.length > 50) {
      return correctAnswer.substring(0, 50) + '...';
    }
    return correctAnswer || '-';
  };

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small">
        <TableHead>
          <TableRow sx={{ bgcolor: 'grey.50' }}>
            <TableCell padding="checkbox">
              <Checkbox indeterminate={isIndeterminate} checked={isAllSelected} onChange={onSelectAll} />
            </TableCell>
            <TableCell sx={{ fontWeight: 600, minWidth: 100 }}>{t('eval.questionType')}</TableCell>
            <TableCell sx={{ fontWeight: 600, minWidth: 300 }}>{t('eval.question')}</TableCell>
            <TableCell sx={{ fontWeight: 600, minWidth: 150 }}>{t('eval.answer')}</TableCell>
            <TableCell sx={{ fontWeight: 600, minWidth: 120 }}>{t('eval.sourceChunk')}</TableCell>
            <TableCell sx={{ fontWeight: 600, width: 120 }} align="center">
              {t('common.actions')}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map(item => (
            <TableRow
              key={item.id}
              hover
              selected={selectedIds.includes(item.id)}
              sx={{ '&:last-child td': { border: 0 } }}
            >
              <TableCell padding="checkbox">
                <Checkbox checked={selectedIds.includes(item.id)} onChange={() => onSelect(item.id)} />
              </TableCell>
              <TableCell>
                <Chip
                  label={t(`eval.questionTypes.${item.questionType}`)}
                  size="small"
                  color={getTypeColor(item.questionType)}
                  variant="outlined"
                />
              </TableCell>
              <TableCell>
                <Typography
                  variant="body2"
                  sx={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}
                >
                  {item.question}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {formatAnswer(item)}
                </Typography>
              </TableCell>
              <TableCell>
                {item.chunks ? (
                  <Chip
                    label={item.chunks.name || item.chunks.fileName}
                    size="small"
                    variant="outlined"
                    sx={{ maxWidth: 150 }}
                  />
                ) : (
                  <Typography variant="body2" color="text.disabled">
                    -
                  </Typography>
                )}
              </TableCell>
              <TableCell align="center">
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                  <Tooltip title={t('datasets.viewDetails')}>
                    <IconButton size="small" onClick={() => onView(item)}>
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t('common.delete')}>
                    <IconButton size="small" color="error" onClick={() => onDelete(item.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
            </TableRow>
          ))}
          {items.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                <Typography color="text.secondary">{t('common.noData')}</Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
