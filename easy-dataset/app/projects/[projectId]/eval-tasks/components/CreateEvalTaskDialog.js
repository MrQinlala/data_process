'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Divider,
  CircularProgress,
  FormHelperText
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import ModelSelector from './ModelSelector';
import QuestionFilter from './QuestionFilter';
import ScoreAnchorsForm from './ScoreAnchorsForm';
import { useEvalTaskForm } from '../hooks/useEvalTaskForm';

import { useEffect } from 'react';

export default function CreateEvalTaskDialog({ open, onClose, projectId, onSuccess }) {
  const { t, i18n } = useTranslation();
  const [submitting, setSubmitting] = useState(false);

  const {
    models,
    selectedModels,
    setSelectedModels,
    judgeModel,
    setJudgeModel,
    evalDatasets,
    availableTags,
    questionTypes,
    setQuestionTypes,
    selectedTags,
    setSelectedTags,
    searchKeyword,
    setSearchKeyword,
    questionCount,
    setQuestionCount,
    filteredTotal,
    sampledIds,
    hasSubjectiveQuestions,
    hasShortAnswer,
    hasOpenEnded,
    shortAnswerScoreAnchors,
    setShortAnswerScoreAnchors,
    openEndedScoreAnchors,
    setOpenEndedScoreAnchors,
    initScoreAnchors,
    loading,
    error,
    setError,
    setSampledIds,
    resetFilters,
    resetForm
  } = useEvalTaskForm(projectId, open);

  // 当有主观题时，初始化评分规则
  useEffect(() => {
    if (hasSubjectiveQuestions && open) {
      initScoreAnchors(i18n.language === 'zh-CN' ? 'zh-CN' : 'en');
    }
  }, [hasSubjectiveQuestions, open, i18n.language]);

  // 统计各题型数量
  const typeStats = {};
  evalDatasets.forEach(d => {
    typeStats[d.questionType] = (typeStats[d.questionType] || 0) + 1;
  });

  const getModelKey = model => `${model.providerId}::${model.modelId}`;

  const handleModelSelectionChange = newSelection => {
    setSelectedModels(newSelection);
    setError('');
  };

  const handleSubmit = async () => {
    // 先清除之前的错误
    setError('');

    // 验证
    if (selectedModels.length === 0) {
      setError(t('evalTasks.errorNoModels'));
      return;
    }

    if (filteredTotal === 0) {
      setError(t('evalTasks.errorNoQuestions'));
      return;
    }

    if (hasSubjectiveQuestions && !judgeModel) {
      setError(t('evalTasks.errorNoJudgeModel'));
      return;
    }

    // 验证教师模型不在测试模型中
    if (judgeModel && selectedModels.includes(judgeModel)) {
      setError(t('evalTasks.errorJudgeSameAsTest'));
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      // 解析选中的模型
      const models = selectedModels.map(m => {
        const [providerId, modelId] = m.split('::');
        return { modelId, providerId }; // 注意顺序：modelId 在前
      });

      // 解析教师模型
      let judgeModelId = null;
      let judgeProviderId = null;
      if (judgeModel) {
        const [pId, mId] = judgeModel.split('::');
        judgeProviderId = pId;
        judgeModelId = mId;
      }

      // 调用后端采样接口获取题目 ID
      const sampleBody = {
        questionTypes: questionTypes,
        tags: selectedTags,
        keyword: searchKeyword.trim() || '',
        limit: questionCount > 0 ? questionCount : undefined
      };

      const sampleResponse = await fetch(`/api/projects/${projectId}/eval-datasets/sample`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sampleBody)
      });

      const sampleResult = await sampleResponse.json();
      if (!sampleResponse.ok || sampleResult.code !== 0) {
        setError(sampleResult.error || t('evalTasks.errorCreateFailed'));
        return;
      }

      const ids = sampleResult?.data?.ids || [];
      if (ids.length === 0) {
        setError(t('evalTasks.errorNoQuestions'));
        return;
      }

      setSampledIds(ids);

      // 构建自定义评分规则对象
      const customScoreAnchors = {};
      if (hasShortAnswer && shortAnswerScoreAnchors.length > 0) {
        customScoreAnchors.short_answer = shortAnswerScoreAnchors;
      }
      if (hasOpenEnded && openEndedScoreAnchors.length > 0) {
        customScoreAnchors.open_ended = openEndedScoreAnchors;
      }

      // 创建任务
      const response = await fetch(`/api/projects/${projectId}/eval-tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          models, // 后端期望的字段名
          judgeModelId, // 分开传递
          judgeProviderId, // 分开传递
          evalDatasetIds: ids,
          language: i18n.language === 'zh-CN' ? 'zh-CN' : 'en',
          customScoreAnchors: Object.keys(customScoreAnchors).length > 0 ? customScoreAnchors : undefined
        })
      });

      const result = await response.json();

      if (result.code === 0) {
        onSuccess && onSuccess(result.data);
        handleClose();
      } else {
        setError(result.error || t('evalTasks.errorCreateFailed'));
      }
    } catch (err) {
      console.error('创建评估任务失败:', err);
      setError(t('evalTasks.errorCreateFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleJudgeModelChange = event => {
    setJudgeModel(event.target.value);
    setError('');
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>{t('evalTasks.createTitle')}</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 1 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {/* 选择测试模型 */}
          <ModelSelector
            models={models}
            selectedModels={selectedModels}
            onSelectionChange={handleModelSelectionChange}
            error={selectedModels.length === 0 && error}
          />

          <Divider sx={{ my: 2 }} />

          {/* 题目筛选 */}
          <QuestionFilter
            questionTypes={questionTypes}
            selectedTags={selectedTags}
            searchKeyword={searchKeyword}
            questionCount={questionCount}
            availableTags={availableTags}
            typeStats={typeStats}
            filteredCount={filteredTotal}
            onQuestionTypesChange={setQuestionTypes}
            onTagsChange={setSelectedTags}
            onSearchChange={setSearchKeyword}
            onQuestionCountChange={setQuestionCount}
            onReset={resetFilters}
          />

          {/* 最终题目统计 */}
          <Box sx={{ mb: 3, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {t('evalTasks.finalSelection')}
              <strong>{sampledIds.length || (questionCount > 0 ? questionCount : filteredTotal)}</strong>{' '}
              {t('evalTasks.questionsSuffix')}
            </Typography>
            {hasSubjectiveQuestions && (
              <Typography variant="body2" color="warning.main" sx={{ mt: 1 }}>
                {t('evalTasks.hasSubjectiveHint')}
              </Typography>
            )}
          </Box>

          {/* 选择教师模型（仅当有主观题时显示） */}
          {hasSubjectiveQuestions && (
            <>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>{t('evalTasks.selectJudgeModel')} *</InputLabel>
                <Select
                  value={judgeModel}
                  onChange={handleJudgeModelChange}
                  label={`${t('evalTasks.selectJudgeModel')} *`}
                >
                  <MenuItem value="">
                    <em>{t('evalTasks.selectJudgeModelPlaceholder')}</em>
                  </MenuItem>
                  {models
                    .filter(m => {
                      const key = `${m.providerId}::${m.modelId}`;
                      return !selectedModels.includes(key);
                    })
                    .map(model => {
                      const key = `${model.providerId}::${model.modelId}`;
                      return (
                        <MenuItem key={key} value={key}>
                          {model.providerName} / {model.modelName}
                        </MenuItem>
                      );
                    })}
                </Select>
                <FormHelperText>{t('evalTasks.selectJudgeModelHint')}</FormHelperText>
              </FormControl>

              {/* 简答题评分规则 */}
              {hasShortAnswer && (
                <ScoreAnchorsForm
                  questionType="short_answer"
                  scoreAnchors={shortAnswerScoreAnchors}
                  onChange={setShortAnswerScoreAnchors}
                  language={i18n.language}
                />
              )}

              {/* 开放题评分规则 */}
              {hasOpenEnded && (
                <ScoreAnchorsForm
                  questionType="open_ended"
                  scoreAnchors={openEndedScoreAnchors}
                  onChange={setOpenEndedScoreAnchors}
                  language={i18n.language}
                />
              )}
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={submitting}>
          {t('common.cancel')}
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={submitting || loading}
          startIcon={submitting && <CircularProgress size={16} />}
        >
          {submitting ? t('common.creating') : t('evalTasks.startEval')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
