'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Typography,
  Alert,
  Tabs,
  Tab
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useTranslation } from 'react-i18next';
import TemplateFormDialog from './TemplateFormDialog';

export default function TemplateManagementDialog({
  open,
  onClose,
  templates,
  onCreateTemplate,
  onUpdateTemplate,
  onDeleteTemplate,
  loading
}) {
  const { t } = useTranslation();
  const [formOpen, setFormOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [currentTab, setCurrentTab] = useState(0); // 0: image, 1: text

  const handleCreate = () => {
    setEditingTemplate(null);
    setFormOpen(true);
  };

  const handleEdit = template => {
    setEditingTemplate(template);
    setFormOpen(true);
  };

  const handleDelete = async templateId => {
    const confirmed = window.confirm(t('questions.template.deleteConfirm'));
    if (confirmed) {
      await onDeleteTemplate(templateId);
    }
  };

  const handleFormSubmit = async data => {
    // 根据当前tab添加sourceType
    const sourceType = currentTab === 0 ? 'image' : 'text';
    const templateData = { ...data, sourceType };

    if (editingTemplate) {
      await onUpdateTemplate(editingTemplate.id, templateData);
    } else {
      await onCreateTemplate(templateData);
    }
    setFormOpen(false);
  };

  const getAnswerTypeLabel = type => {
    const labels = {
      text: t('questions.template.answerType.text'),
      label: t('questions.template.answerType.tags'),
      custom_format: t('questions.template.answerType.customFormat')
    };
    return labels[type] || type;
  };

  // 按数据源类型分组模板
  const imageTemplates = templates.filter(t => t.sourceType === 'image');
  const textTemplates = templates.filter(t => t.sourceType === 'text');

  const currentTemplates = currentTab === 0 ? imageTemplates : textTemplates;

  const renderTemplateList = templateList => {
    if (templateList.length === 0) {
      return <Alert severity="info">{t('questions.template.noTemplates')}</Alert>;
    }

    return (
      <List>
        {templateList.map(template => (
          <ListItem key={template.id} divider>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography>{template.question}</Typography>
                  <Chip
                    label={getAnswerTypeLabel(template.answerType)}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                  {template.usageCount > 0 && (
                    <Chip
                      label={`${t('questions.template.used')} ${template.usageCount}`}
                      size="small"
                      color="default"
                    />
                  )}
                </Box>
              }
              secondary={template.description}
            />
            <ListItemSecondaryAction>
              <IconButton edge="end" onClick={() => handleEdit(template)} sx={{ mr: 1 }}>
                <EditIcon />
              </IconButton>
              <IconButton edge="end" onClick={() => handleDelete(template.id)} disabled={template.usageCount > 0}>
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    );
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">{t('questions.template.management')}</Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate} size="small">
              {t('questions.template.create')}
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={currentTab} onChange={(e, newValue) => setCurrentTab(newValue)}>
              <Tab label={t('questions.template.sourceType.image')} />
              <Tab label={t('questions.template.sourceType.text')} />
            </Tabs>
          </Box>
          {renderTemplateList(currentTemplates)}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>{t('common.close')}</Button>
        </DialogActions>
      </Dialog>

      <TemplateFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        template={editingTemplate}
        sourceType={currentTab === 0 ? 'image' : 'text'}
      />
    </>
  );
}
