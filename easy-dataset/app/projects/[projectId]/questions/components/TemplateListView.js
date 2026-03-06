'use client';

import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Typography,
  Alert
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTranslation } from 'react-i18next';

export default function TemplateListView({ templates, onEditTemplate, onDeleteTemplate, loading }) {
  const { t } = useTranslation();

  const getAnswerTypeLabel = type => {
    const labels = {
      text: t('questions.template.answerType.text'),
      label: t('questions.template.answerType.tags'),
      custom_format: t('questions.template.answerType.customFormat')
    };
    return labels[type] || type;
  };

  const getSourceTypeLabel = type => {
    const labels = {
      image: t('questions.template.sourceType.image'),
      text: t('questions.template.sourceType.text')
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>{t('common.loading')}</Typography>
      </Box>
    );
  }

  if (!templates || templates.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">{t('questions.template.noTemplates')}</Alert>
      </Box>
    );
  }

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>{t('questions.template.question')}</TableCell>
            <TableCell>{t('questions.template.sourceType.label')}</TableCell>
            <TableCell>{t('questions.template.answerType.label')}</TableCell>
            <TableCell>{t('questions.template.description')}</TableCell>
            <TableCell>{t('questions.template.used')}</TableCell>
            <TableCell align="right">{t('common.actions')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {templates.map(template => (
            <TableRow key={template.id} hover>
              <TableCell>
                <Typography variant="body2" sx={{ maxWidth: 300 }}>
                  {template.question}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip
                  label={getSourceTypeLabel(template.sourceType)}
                  size="small"
                  color={template.sourceType === 'image' ? 'primary' : 'secondary'}
                  variant="outlined"
                />
              </TableCell>
              <TableCell>
                <Chip label={getAnswerTypeLabel(template.answerType)} size="small" color="default" />
              </TableCell>
              <TableCell>
                <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 200 }}>
                  {template.description || '-'}
                </Typography>
              </TableCell>
              <TableCell>
                {template.usageCount > 0 ? (
                  <Chip label={template.usageCount} size="small" color="success" />
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    0
                  </Typography>
                )}
              </TableCell>
              <TableCell align="right">
                <IconButton size="small" onClick={() => onEditTemplate(template)} sx={{ mr: 1 }}>
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => onDeleteTemplate(template.id)}
                  disabled={template.usageCount > 0}
                  color="error"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
