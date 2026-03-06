'use client';

import { useState, useEffect } from 'react';
import { Box, Paper, Typography, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import Image from 'next/image';
import SaveIcon from '@mui/icons-material/Save';
import AnswerInput from '../../images/components/annotation/AnswerInput';

function handleAnswer(dataset) {
  const { answer, answerType } = dataset;
  if (answerType === 'label' || answerType === 'custom_format') {
    try {
      return JSON.parse(answer);
    } catch (e) {
      return answer;
    }
  }
  return answer;
}

/**
 * 数据集主要内容组件
 */
export default function DatasetContent({ dataset, projectId, onAnswerChange }) {
  const { t } = useTranslation();
  const [currentAnswer, setCurrentAnswer] = useState(() => handleAnswer(dataset));
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  // 当 dataset 变化时，重置状态
  useEffect(() => {
    setCurrentAnswer(handleAnswer(dataset));
    setHasChanges(false);
  }, [dataset.id, dataset.answer]);

  // 处理答案变化
  const handleAnswerChange = newAnswer => {
    setCurrentAnswer(newAnswer);

    // 检测是否有变化
    const originalAnswer = handleAnswer(dataset);
    const hasChanged = JSON.stringify(newAnswer) !== JSON.stringify(originalAnswer);
    setHasChanges(hasChanged);
  };

  // 保存答案
  const handleSave = async () => {
    setSaving(true);
    try {
      let answerToSave = currentAnswer;
      if (typeof answerToSave !== 'string') {
        answerToSave = JSON.stringify(answerToSave, null, 2);
      }
      await onAnswerChange(answerToSave);
      setHasChanges(false);
    } catch (error) {
      console.error('保存失败:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Paper sx={{ p: 3 }}>
        {/* 问题和保存按钮 */}
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography
            variant="body1"
            sx={{
              flex: 1,
              fontSize: '1rem',
              lineHeight: 1.7,
              fontWeight: 600,
              backgroundColor: 'grey.100',
              p: 2,
              borderRadius: 2
            }}
          >
            {dataset.question}
          </Typography>

          {/* 保存按钮 - 只在有变化时显示 */}
          {hasChanges && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={saving}
              sx={{
                minWidth: 100,
                height: 'fit-content',
                whiteSpace: 'nowrap'
              }}
            >
              {saving ? t('common.saving', '保存中...') : t('common.save', '保存')}
            </Button>
          )}
        </Box>

        {/* 答案编辑器 */}
        <AnswerInput
          answerType={dataset.answerType || 'text'}
          answer={currentAnswer}
          onAnswerChange={handleAnswerChange}
          labels={dataset.availableLabels || []}
          customFormat={dataset.customFormat}
          projectId={projectId}
          imageName={dataset.imageName}
          question={dataset.questionData}
        />

        {/* 图片 */}
        <Box sx={{ mt: 3 }}>
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              maxWidth: '800px',
              margin: '0 auto',
              paddingTop: '56.25%',
              borderRadius: 2,
              overflow: 'hidden',
              bgcolor: 'grey.100',
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            {dataset.base64 ? (
              <img
                src={dataset.base64}
                alt={dataset.imageName}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain'
                }}
              />
            ) : (
              <Image src="/placeholder.png" alt={dataset.imageName} fill style={{ objectFit: 'contain' }} unoptimized />
            )}
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, textAlign: 'center' }}>
            {dataset.imageName}
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}
