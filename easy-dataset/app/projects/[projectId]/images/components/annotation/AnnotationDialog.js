'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  CircularProgress
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import Image from 'next/image';
import QuestionSelector from './QuestionSelector';
import AnswerInput from './AnswerInput';

export default function AnnotationDialog({
  open,
  onClose,
  image,
  templates,
  selectedTemplate,
  onTemplateChange,
  answer,
  onAnswerChange,
  onSave,
  onSaveAndContinue,
  saving,
  loading,
  onOpenCreateQuestion,
  onOpenCreateTemplate
}) {
  const { t } = useTranslation();

  if (!image) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle sx={{ pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h5" fontWeight="600">
            {t('images.annotateImage', { defaultValue: '标注图片' })}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {image && (
              <Chip
                label={`${image.answeredQuestions?.length || 0} / ${(image.answeredQuestions?.length || 0) + (image.unansweredQuestions?.length || 0)} 已完成`}
                color="primary"
                variant="outlined"
                size="small"
              />
            )}
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {/* 图片预览区域 */}
        <Box
          sx={{
            display: 'flex',
            gap: 4,
            mb: 4,
            minHeight: 450
          }}
        >
          {/* 图片预览 */}
          <Box
            sx={{
              flex: '0 0 450px',
              display: 'flex',
              flexDirection: 'column',
              gap: 2
            }}
          >
            {image && (
              <>
                <Box
                  sx={{
                    position: 'relative',
                    width: '100%',
                    height: 400,
                    border: '2px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    overflow: 'hidden',
                    bgcolor: 'grey.50'
                  }}
                >
                  {image.base64 ? (
                    <Image src={image.base64} alt={image.imageName} fill style={{ objectFit: 'contain' }} priority />
                  ) : (
                    <Box
                      sx={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'text.secondary'
                      }}
                    >
                      <Typography variant="body2">
                        {t('images.imageLoadError', { defaultValue: '图片加载失败' })}
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* 图片信息卡片 */}
                <Box
                  sx={{
                    p: 2,
                    bgcolor: 'grey.50',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider'
                  }}
                >
                  <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                    {image.imageName}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                    {image.width && image.height && (
                      <Chip label={`${image.width} × ${image.height}`} size="small" variant="outlined" />
                    )}
                    {image.size && (
                      <Chip label={`${(image.size / 1024).toFixed(2)} KB`} size="small" variant="outlined" />
                    )}
                    {image.format && <Chip label={image.format?.toUpperCase()} size="small" variant="outlined" />}
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    <strong>{t('images.annotatedCount', { defaultValue: '已标注' })}:</strong> {image.datasetCount || 0}{' '}
                    {t('images.questions', { defaultValue: '个问题' })}
                  </Typography>
                </Box>
              </>
            )}
          </Box>

          {/* 标注区域 */}
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
              minWidth: 0
            }}
          >
            {/* 问题选择器 */}
            <Box
              sx={{
                p: 3,
                bgcolor: 'background.paper',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider'
              }}
            >
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <QuestionSelector
                  templates={templates}
                  selectedTemplate={selectedTemplate}
                  onTemplateChange={onTemplateChange}
                  answeredQuestions={image?.answeredQuestions || []}
                  unansweredQuestions={image?.unansweredQuestions || []}
                  onOpenCreateQuestion={onOpenCreateQuestion}
                  onOpenCreateTemplate={onOpenCreateTemplate}
                />
              )}
            </Box>

            {/* 答案输入区域 */}
            {selectedTemplate && (
              <Box
                sx={{
                  p: 3,
                  bgcolor: 'background.paper',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider'
                }}
              >
                <AnswerInput
                  answerType={selectedTemplate.answerType}
                  answer={answer}
                  onAnswerChange={onAnswerChange}
                  labels={selectedTemplate.labels}
                  customFormat={selectedTemplate.customFormat}
                  projectId={image?.projectId}
                  imageName={image?.imageName}
                  question={selectedTemplate}
                />
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          p: 3,
          pt: 0,
          gap: 1,
          justifyContent: 'space-between',
          display: 'flex',
          flexWrap: 'wrap'
        }}
      >
        {/* 左侧：创建按钮 */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            onClick={onOpenCreateQuestion}
            variant="outlined"
            size="small"
            sx={{ borderRadius: 2, textTransform: 'none' }}
          >
            {t('images.createQuestion', { defaultValue: '创建问题' })}
          </Button>
          <Button
            onClick={onOpenCreateTemplate}
            variant="outlined"
            size="small"
            sx={{ borderRadius: 2, textTransform: 'none' }}
          >
            {t('images.createTemplate', { defaultValue: '创建问题模板' })}
          </Button>
        </Box>

        {/* 右侧：操作按钮 */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button onClick={onClose} disabled={saving} variant="outlined" sx={{ borderRadius: 2 }}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={onSaveAndContinue}
            disabled={saving || !selectedTemplate}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            {saving ? <CircularProgress size={20} /> : t('images.saveAndContinue', { defaultValue: '保存并继续' })}
          </Button>
          <Button onClick={onSave} disabled={saving || !selectedTemplate} variant="contained" sx={{ borderRadius: 2 }}>
            {saving ? <CircularProgress size={20} /> : t('common.save')}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
