'use client';

import { useState, useEffect } from 'react';
import { getDefaultScoreAnchors } from '@/lib/llm/prompts/llmJudge';

export function useEvalTaskForm(projectId, open) {
  const [models, setModels] = useState([]);
  const [selectedModels, setSelectedModels] = useState([]);
  const [judgeModel, setJudgeModel] = useState('');
  const [evalDatasets, setEvalDatasets] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);

  // 筛选条件
  const [questionTypes, setQuestionTypes] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [questionCount, setQuestionCount] = useState(0);

  // 后端统计 & 采样结果
  const [filteredTotal, setFilteredTotal] = useState(0);
  const [sampledIds, setSampledIds] = useState([]);
  const [hasSubjectiveQuestions, setHasSubjectiveQuestions] = useState(false);
  // 主观题类型统计（用于确定显示哪个评分规则表单）
  const [hasShortAnswer, setHasShortAnswer] = useState(false);
  const [hasOpenEnded, setHasOpenEnded] = useState(false);

  // 自定义评分规则
  const [shortAnswerScoreAnchors, setShortAnswerScoreAnchors] = useState([]);
  const [openEndedScoreAnchors, setOpenEndedScoreAnchors] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 加载数据
  useEffect(() => {
    if (open && projectId) {
      loadModels();
      loadEvalDatasets();
    }
  }, [open, projectId]);

  // 当筛选条件变化时，调用后端统计数量
  useEffect(() => {
    if (!open || !projectId) return;

    const controller = new AbortController();

    const fetchCount = async () => {
      try {
        const params = new URLSearchParams();
        if (questionTypes.length > 0) {
          questionTypes.forEach(t => params.append('questionTypes', t));
        }
        if (searchKeyword.trim()) {
          params.append('keyword', searchKeyword.trim());
        }
        if (selectedTags.length > 0) {
          selectedTags.forEach(tag => params.append('tags', tag));
        }

        const response = await fetch(`/api/projects/${projectId}/eval-datasets/count?${params.toString()}`, {
          signal: controller.signal
        });
        if (response.ok) {
          const result = await response.json();
          const total = result?.data?.total ?? 0;
          const hasSubjective = result?.data?.hasSubjective ?? false;
          const hasShort = result?.data?.hasShortAnswer ?? false;
          const hasOpen = result?.data?.hasOpenEnded ?? false;
          setFilteredTotal(total);
          setHasSubjectiveQuestions(hasSubjective);
          setHasShortAnswer(hasShort);
          setHasOpenEnded(hasOpen);
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('加载评估题目数量失败:', err);
        }
      }
    };

    fetchCount();

    return () => {
      controller.abort();
    };
  }, [open, projectId, questionTypes, selectedTags, searchKeyword]);

  const loadModels = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/model-config`);
      if (response.ok) {
        const result = await response.json();
        const modelList = result?.data || [];
        const availableModels = modelList.filter(m => m.apiKey && m.apiKey.trim() !== '' && m.status === 1);
        setModels(availableModels);
      }
    } catch (err) {
      console.error('加载模型列表失败:', err);
      setModels([]);
    }
  };

  const loadEvalDatasets = async () => {
    try {
      setLoading(true);
      // 这里只需要拿到全部可用标签和题型分布，可以复用已有列表接口或标签接口
      const response = await fetch(`/api/projects/${projectId}/eval-datasets?includeStats=true&page=1&pageSize=20`);
      if (response.ok) {
        const data = await response.json();
        const stats = data.stats || {};
        const byTag = stats.byTag || {};
        const tags = Object.keys(byTag);
        setAvailableTags(tags.sort());

        // 用部分数据来判断是否存在主观题（类型统计更准确）
        const byType = stats.byType || {};
        const mockDatasets = Object.entries(byType).map(([type]) => ({ questionType: type }));
        setEvalDatasets(mockDatasets);
      }
    } catch (err) {
      console.error('加载评估题目失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setQuestionTypes([]);
    setSelectedTags([]);
    setSearchKeyword('');
    setQuestionCount(0);
    setFilteredTotal(0);
    setSampledIds([]);
    setHasShortAnswer(false);
    setHasOpenEnded(false);
  };

  // 初始化评分规则（根据语言环境）
  const initScoreAnchors = (language = 'zh-CN') => {
    setShortAnswerScoreAnchors(getDefaultScoreAnchors('short_answer', language));
    setOpenEndedScoreAnchors(getDefaultScoreAnchors('open_ended', language));
  };

  const resetForm = () => {
    setSelectedModels([]);
    setJudgeModel('');
    resetFilters();
    setError('');
    setShortAnswerScoreAnchors([]);
    setOpenEndedScoreAnchors([]);
  };

  return {
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
  };
}
