'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * 盲测任务详情和盲测过程管理 Hook
 */
export default function useBlindTestDetail(projectId, taskId) {
  // 任务详情
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 当前题目状态
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [leftAnswer, setLeftAnswer] = useState(null);
  const [rightAnswer, setRightAnswer] = useState(null);
  const [isSwapped, setIsSwapped] = useState(false);
  const [answersLoading, setAnswersLoading] = useState(false);

  // 流式输出状态
  const [streamingA, setStreamingA] = useState(false);
  const [streamingB, setStreamingB] = useState(false);
  const abortControllerRef = useRef(null);
  const hasAutoLoadedRef = useRef(false);

  // 投票状态
  const [voting, setVoting] = useState(false);
  const [completed, setCompleted] = useState(false);

  // 加载任务详情
  const loadTask = useCallback(
    async (silent = false) => {
      if (!projectId || !taskId) return;

      try {
        if (!silent) setLoading(true);
        setError('');
        // 添加时间戳防止缓存
        const response = await fetch(`/api/projects/${projectId}/blind-test-tasks/${taskId}?t=${Date.now()}`, {
          cache: 'no-store',
          headers: {
            Pragma: 'no-cache',
            'Cache-Control': 'no-cache'
          }
        });
        const result = await response.json();

        if (result.code === 0) {
          console.log('任务状态更新:', result.data.completedCount, '/', result.data.totalCount);
          setTask(result.data);
          // 检查任务是否已完成 (0=进行中, 1=已完成, 2=失败, 3=已中断)
          if (result.data.status !== 0) {
            setCompleted(true);
          }
        } else {
          if (!silent) setError(result.error || '加载任务详情失败');
        }
      } catch (err) {
        console.error('加载任务详情失败:', err);
        if (!silent) setError('加载任务详情失败');
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [projectId, taskId]
  );

  // 流式获取当前题目和模型回答
  const fetchCurrentQuestion = useCallback(async () => {
    if (!projectId || !taskId) return;

    // 取消上一次的请求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      setAnswersLoading(true);
      setError('');
      setCurrentQuestion(null);
      setLeftAnswer({ fullContent: '', content: '', thinking: '', isThinking: false, duration: 0, error: null });
      setRightAnswer({ fullContent: '', content: '', thinking: '', isThinking: false, duration: 0, error: null });

      // 1. 先获取题目信息
      const questionRes = await fetch(`/api/projects/${projectId}/blind-test-tasks/${taskId}/question`, {
        signal: controller.signal,
        cache: 'no-store'
      });

      if (!questionRes.ok) throw new Error('获取题目失败');

      const questionData = await questionRes.json();

      if (questionData.completed) {
        setCompleted(true);
        return;
      }

      setCurrentQuestion({
        id: questionData.questionId,
        question: questionData.question,
        answer: questionData.answer,
        index: questionData.questionIndex,
        total: questionData.totalQuestions
      });
      setIsSwapped(questionData.isSwapped);
      setCompleted(false);

      // 2. 并行调用两个模型的流式接口
      setStreamingA(true);
      setStreamingB(true);

      const processStream = async (modelType, setAnswer, setStreaming) => {
        const modelStartTime = Date.now();
        try {
          const streamUrl = `/api/projects/${projectId}/blind-test-tasks/${taskId}/stream-model?model=${modelType}`;
          const response = await fetch(streamUrl, {
            signal: controller.signal
          });

          if (!response.ok) {
            throw new Error(`模型${modelType}调用失败: ${response.status}`);
          }

          const reader = response.body.getReader();
          const decoder = new TextDecoder();

          let fullContent = '';
          let currentContent = '';
          let currentThinking = '';
          let isInThinking = false;
          let pendingBuffer = ''; // 用于处理跨 chunk 的标签识别

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            pendingBuffer += chunk;

            // 处理缓冲区中的内容
            while (pendingBuffer.length > 0) {
              // 如果正在思考中，寻找结束标签
              if (isInThinking) {
                const endTagIndex = pendingBuffer.indexOf('</think>');
                if (endTagIndex !== -1) {
                  const thinkingPart = pendingBuffer.substring(0, endTagIndex);
                  currentThinking += thinkingPart;
                  fullContent += thinkingPart + '</think>';
                  isInThinking = false;
                  pendingBuffer = pendingBuffer.substring(endTagIndex + 8);
                  continue;
                } else {
                  // 没有找到结束标签，但可能缓冲区末尾包含了部分结束标签
                  // 保留最后 7 个字符（"</think>" 长度为 8）以防被截断
                  const safeLength = Math.max(0, pendingBuffer.length - 7);
                  const processingPart = pendingBuffer.substring(0, safeLength);
                  currentThinking += processingPart;
                  fullContent += processingPart;
                  pendingBuffer = pendingBuffer.substring(safeLength);
                  break; // 等待下一个 chunk
                }
              } else {
                // 不在思考中，寻找开始标签
                const startTagIndex = pendingBuffer.indexOf('<think>');
                if (startTagIndex !== -1) {
                  const contentPart = pendingBuffer.substring(0, startTagIndex);
                  currentContent += contentPart;
                  fullContent += contentPart + '<think>';
                  isInThinking = true;
                  pendingBuffer = pendingBuffer.substring(startTagIndex + 7);
                  continue;
                } else {
                  // 没有找到开始标签，保留最后 6 个字符以防开始标签被截断
                  const safeLength = Math.max(0, pendingBuffer.length - 6);
                  const processingPart = pendingBuffer.substring(0, safeLength);
                  currentContent += processingPart;
                  fullContent += processingPart;
                  pendingBuffer = pendingBuffer.substring(safeLength);
                  break; // 等待下一个 chunk
                }
              }
            }

            setAnswer(prev => ({
              ...prev,
              fullContent,
              content: currentContent,
              thinking: currentThinking,
              isThinking: isInThinking
            }));
          }

          const modelDuration = Date.now() - modelStartTime;
          setAnswer(prev => ({ ...prev, duration: modelDuration }));
          setStreaming(false);
        } catch (err) {
          if (err.name === 'AbortError') return;
          console.error(`模型${modelType}错误:`, err);
          const modelDuration = Date.now() - modelStartTime;
          setAnswer(prev => ({
            ...prev,
            error: err.message,
            duration: modelDuration
          }));
          setStreaming(false);
        }
      };

      // 根据是否交换决定左右对应的模型
      const leftModel = questionData.isSwapped ? 'B' : 'A';
      const rightModel = questionData.isSwapped ? 'A' : 'B';

      await Promise.all([
        processStream(leftModel, setLeftAnswer, setStreamingA),
        processStream(rightModel, setRightAnswer, setStreamingB)
      ]);
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.error('获取题目失败:', err);
      setError(err.message || '获取当前题目失败');
      setStreamingA(false);
      setStreamingB(false);
    } finally {
      // 只有当前请求未被取消时才重置loading
      if (abortControllerRef.current === controller) {
        setAnswersLoading(false);
      }
    }
  }, [projectId, taskId]);

  // 提交投票
  const submitVote = useCallback(
    async vote => {
      if (!projectId || !taskId || !currentQuestion) return { success: false };

      try {
        setVoting(true);
        setError('');

        const response = await fetch(`/api/projects/${projectId}/blind-test-tasks/${taskId}/vote`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            vote,
            questionId: currentQuestion.id,
            isSwapped,
            // 使用 fullContent 提交，包含思考过程
            leftAnswer: leftAnswer?.fullContent || leftAnswer?.content || '',
            rightAnswer: rightAnswer?.fullContent || rightAnswer?.content || ''
          })
        });

        const result = await response.json();

        if (result.code === 0) {
          // 等待任务状态更新（进度条）
          await loadTask(true);

          if (result.data.isCompleted) {
            setCompleted(true);
          } else {
            // 获取下一题
            await fetchCurrentQuestion();
          }
          return { success: true, data: result.data };
        } else {
          setError(result.error || '提交投票失败');
          return { success: false, error: result.error };
        }
      } catch (err) {
        console.error('提交投票失败:', err);
        setError('提交投票失败');
        return { success: false, error: '提交投票失败' };
      } finally {
        setVoting(false);
      }
    },
    [projectId, taskId, currentQuestion, isSwapped, leftAnswer, rightAnswer, loadTask, fetchCurrentQuestion]
  );

  // 中断任务
  const interruptTask = useCallback(async () => {
    if (!projectId || !taskId) return false;

    try {
      const response = await fetch(`/api/projects/${projectId}/blind-test-tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'interrupt' })
      });

      const result = await response.json();

      if (result.code === 0) {
        setCompleted(true);
        loadTask();
        return true;
      } else {
        setError(result.error || '中断任务失败');
        return false;
      }
    } catch (err) {
      console.error('中断任务失败:', err);
      setError('中断任务失败');
      return false;
    }
  }, [projectId, taskId, loadTask]);

  // 初始加载
  useEffect(() => {
    loadTask();
  }, [loadTask]);

  // 任务加载完成后，如果任务进行中，自动获取当前题目（只执行一次）
  useEffect(() => {
    if (task && task.status === 0 && !completed && !hasAutoLoadedRef.current && projectId && taskId) {
      hasAutoLoadedRef.current = true;
      fetchCurrentQuestion();
    }
  }, [task, completed, projectId, taskId, fetchCurrentQuestion]);

  // 计算结果统计
  const getResultStats = useCallback(() => {
    if (!task?.detail?.results) return null;

    const results = task.detail.results;
    const totalModelAScore = results.reduce((sum, r) => sum + (r.modelAScore || 0), 0);
    const totalModelBScore = results.reduce((sum, r) => sum + (r.modelBScore || 0), 0);

    const leftWins = results.filter(r => r.vote === 'left').length;
    const rightWins = results.filter(r => r.vote === 'right').length;
    const bothGood = results.filter(r => r.vote === 'both_good').length;
    const bothBad = results.filter(r => r.vote === 'both_bad').length;

    // 计算实际模型胜出次数（需要考虑 swap）
    const modelAWins = results.filter(r => {
      if (r.vote === 'left' && !r.isSwapped) return true;
      if (r.vote === 'right' && r.isSwapped) return true;
      return false;
    }).length;

    const modelBWins = results.filter(r => {
      if (r.vote === 'left' && r.isSwapped) return true;
      if (r.vote === 'right' && !r.isSwapped) return true;
      return false;
    }).length;

    return {
      totalQuestions: results.length,
      modelAScore: totalModelAScore,
      modelBScore: totalModelBScore,
      modelAWins,
      modelBWins,
      ties: bothGood + bothBad,
      bothGood,
      bothBad,
      leftWins,
      rightWins
    };
  }, [task]);

  // 组件卸载时取消请求
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    // 任务详情
    task,
    loading,
    error,
    setError,
    loadTask,

    // 当前题目状态
    currentQuestion,
    leftAnswer,
    rightAnswer,
    answersLoading,

    // 流式状态
    streamingA,
    streamingB,

    // 投票状态
    voting,
    completed,

    // 操作
    fetchCurrentQuestion,
    submitVote,
    interruptTask,

    // 结果统计
    getResultStats
  };
}
