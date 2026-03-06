'use client';

import { Box, Typography, keyframes, Paper } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { handleLongFileName } from '@/lib/file/file-process';
import { useState, useEffect } from 'react';

// 定义动画效果
const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(32, 76, 255, 0.2);
  }
  70% {
    box-shadow: 0 0 0 15px rgba(32, 76, 255, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(32, 76, 255, 0);
  }
`;

const rotateAnimation = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

/**
 * 文件处理进度展示组件 - 美化版
 *
 * @param {Object} props
 * @param {Object} props.fileTask - 文件处理任务信息
 */
export default function FileLoadingProgress({ fileTask }) {
  const { t } = useTranslation();
  const [animationStep, setAnimationStep] = useState(0);

  // 创建动态效果
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationStep(prev => (prev + 1) % 4);
    }, 600);
    return () => clearInterval(interval);
  }, []);

  if (!fileTask) {
    return null;
  }

  const pageProgress = (fileTask.current.processedPage / fileTask.current.totalPage) * 100;
  const filesProgress = (fileTask.processedFiles / fileTask.totalFiles) * 100;

  // 生成进度指示器文本
  const getProgressIndicator = () => {
    const dots = '.';
    return dots.repeat(animationStep + 1);
  };

  return (
    <Paper
      elevation={3}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: 'auto',
        minHeight: '25vh',
        width: '80%',
        maxWidth: '600px',
        margin: '0 auto',
        padding: 4,
        borderRadius: 3,
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(45deg, #f9f9f9 0%, #ffffff 100%)',
        animation: `${pulse} 2s infinite`
      }}
    >
      {/* 背景动画元素 */}
      <Box
        sx={{
          position: 'absolute',
          top: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          background: 'radial-gradient(circle, rgba(32,76,255,0.05) 0%, rgba(255,255,255,0) 70%)',
          animation: `${rotateAnimation} 15s linear infinite`,
          zIndex: 0
        }}
      />

      {/* 主标题 */}
      <Typography
        variant="h5"
        fontWeight="bold"
        sx={{
          mb: 3,
          position: 'relative',
          zIndex: 1,
          background: 'linear-gradient(90deg, #3a7bd5 0%, #00d2ff 100%)',
          backgroundClip: 'text',
          textFillColor: 'transparent',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}
      >
        {t('textSplit.pdfProcessingLoading')}
        {getProgressIndicator()}
      </Typography>

      {/* 处理进度显示区域 */}
      <Box sx={{ width: '90%', mt: 2, mb: 3, position: 'relative', zIndex: 1 }}>
        {/* 当前文件进度 */}
        <ProgressSection
          label={t('textSplit.pdfPageProcessStatus', {
            fileName: handleLongFileName(fileTask.current.fileName),
            total: fileTask.current.totalPage,
            completed: fileTask.current.processedPage
          })}
          progress={pageProgress}
          color="#3a7bd5"
        />

        {/* 总文件进度 */}
        <ProgressSection
          label={t('textSplit.pdfProcessStatus', {
            total: fileTask.totalFiles,
            completed: fileTask.processedFiles
          })}
          progress={filesProgress}
          color="#00d2ff"
          mt={3}
        />
      </Box>
    </Paper>
  );
}

/**
 * 进度条区域组件
 */
function ProgressSection({ label, progress, color, mt = 0 }) {
  return (
    <Box sx={{ mt }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          mb: 1,
          alignItems: 'center'
        }}
      >
        <Typography
          variant="body2"
          fontWeight="medium"
          sx={{
            color: 'text.primary',
            fontSize: '0.9rem'
          }}
        >
          {label}
        </Typography>
        <Typography
          variant="h6"
          fontWeight="bold"
          sx={{
            color,
            fontSize: '1.1rem'
          }}
        >
          {Math.round(progress)}%
        </Typography>
      </Box>

      {/* 自定义进度条 */}
      <Box
        sx={{
          height: 10,
          borderRadius: 5,
          background: '#f0f0f0',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)'
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: `${progress}%`,
            borderRadius: 5,
            background: `linear-gradient(90deg, ${color} 0%, ${color}80 100%)`,
            transition: 'width 0.5s ease',
            backgroundSize: '200% 100%',
            animation: `${shimmer} 2s infinite linear`
          }}
        />
      </Box>
    </Box>
  );
}
