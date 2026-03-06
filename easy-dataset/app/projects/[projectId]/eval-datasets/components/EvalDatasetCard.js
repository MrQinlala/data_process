'use client';

import { Card, CardContent, Box, Typography, Chip, Checkbox, IconButton, Tooltip, Divider } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import ShortTextIcon from '@mui/icons-material/ShortText';
import NotesIcon from '@mui/icons-material/Notes';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { useTheme, alpha } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';

// 题型图标和颜色映射
const QUESTION_TYPE_CONFIG = {
  true_false: {
    icon: CheckCircleIcon,
    color: 'success',
    bgColor: 'success.light'
  },
  single_choice: {
    icon: RadioButtonCheckedIcon,
    color: 'primary',
    bgColor: 'primary.light'
  },
  multiple_choice: {
    icon: CheckBoxIcon,
    color: 'secondary',
    bgColor: 'secondary.light'
  },
  short_answer: {
    icon: ShortTextIcon,
    color: 'warning',
    bgColor: 'warning.light'
  },
  open_ended: {
    icon: NotesIcon,
    color: 'info',
    bgColor: 'info.light'
  }
};

export default function EvalDatasetCard({ item, selected, onSelect, onEdit, onDelete, projectId }) {
  const theme = useTheme();
  const { t } = useTranslation();
  const router = useRouter();

  const typeConfig = QUESTION_TYPE_CONFIG[item.questionType] || QUESTION_TYPE_CONFIG.short_answer;
  const TypeIcon = typeConfig.icon;

  // 解析选项
  const options = item.options
    ? typeof item.options === 'string'
      ? JSON.parse(item.options || '[]')
      : item.options
    : [];

  // 解析答案
  const correctAnswer = item.correctAnswer;

  const handleCardClick = e => {
    // 如果点击的是复选框或按钮，不跳转
    if (e.target.closest('.MuiCheckbox-root') || e.target.closest('.MuiIconButton-root')) {
      return;
    }
    router.push(`/projects/${projectId}/eval-datasets/${item.id}`);
  };

  return (
    <Card
      variant="outlined"
      onClick={handleCardClick}
      sx={{
        height: 'fit-content',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.2s ease-in-out',
        borderColor: selected ? theme.palette.primary.main : theme.palette.divider,
        bgcolor: selected ? alpha(theme.palette.primary.main, 0.04) : 'background.paper',
        borderRadius: 2,
        position: 'relative',
        cursor: 'pointer',
        '&:hover': {
          borderColor: theme.palette.primary.main,
          transform: 'translateY(-4px)',
          boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.08)}`
        }
      }}
    >
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2.5 }}>
        {/* 头部：题型标签和操作 */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Checkbox
              size="small"
              checked={selected}
              onChange={e => {
                e.stopPropagation();
                onSelect(item.id);
              }}
              sx={{ p: 0.5, ml: -0.5 }}
            />
            <Chip
              icon={<TypeIcon sx={{ fontSize: '16px !important' }} />}
              label={t(`eval.questionTypes.${item.questionType}`)}
              size="small"
              color={typeConfig.color}
              variant="outlined"
              sx={{
                fontWeight: 600,
                borderWidth: '1.5px',
                bgcolor: alpha(theme.palette[typeConfig.color].main, 0.05)
              }}
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title={t('common.edit')}>
              <IconButton
                size="small"
                onClick={e => {
                  e.stopPropagation();
                  onEdit(item);
                }}
                sx={{
                  color: 'text.secondary',
                  '&:hover': { color: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.1) }
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('common.delete')}>
              <IconButton
                size="small"
                onClick={e => {
                  e.stopPropagation();
                  onDelete(item.id);
                }}
                sx={{
                  color: 'text.secondary',
                  '&:hover': { color: 'error.main', bgcolor: alpha(theme.palette.error.main, 0.1) }
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* 问题内容 */}
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="body1"
            sx={{
              fontWeight: 600,
              lineHeight: 1.6,
              color:
                item.questionType === 'true_false'
                  ? correctAnswer === '✅'
                    ? 'success.main'
                    : 'error.main'
                  : 'text.primary',
              display: 'inline'
            }}
          >
            {item.questionType === 'true_false' && correctAnswer} {item.question}
          </Typography>
        </Box>

        {/* 选项列表（仅单选/多选显示） */}
        {(item.questionType === 'single_choice' || item.questionType === 'multiple_choice') && options.length > 0 && (
          <Box sx={{ mb: 2, flex: 1 }}>
            {(item.questionType === 'multiple_choice' ? options : options.slice(0, 4)).map((option, index) => {
              const optionLabel = String.fromCharCode(65 + index); // A, B, C, D
              // 解析多选题答案，支持多种格式：数组、JSON字符串、逗号分隔字符串
              const parseMultipleAnswers = answer => {
                if (Array.isArray(answer)) return answer;
                if (!answer) return [];
                // 尝试解析 JSON 数组
                if (answer.startsWith('[')) {
                  try {
                    return JSON.parse(answer);
                  } catch (e) {
                    return [];
                  }
                }
                // 逗号分隔字符串格式，如 "A,B,D"
                return answer.split(',').map(s => s.trim());
              };
              const isCorrect =
                item.questionType === 'multiple_choice'
                  ? parseMultipleAnswers(correctAnswer).includes(optionLabel)
                  : correctAnswer === optionLabel;

              return (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: 1,
                    mb: 0.5,
                    p: '4px 8px',
                    borderRadius: 1,
                    bgcolor: isCorrect ? alpha(theme.palette.success.main, 0.08) : 'transparent',
                    border: '1px solid',
                    borderColor: isCorrect ? alpha(theme.palette.success.main, 0.3) : 'transparent'
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 700,
                      color: isCorrect ? 'success.main' : 'text.secondary',
                      minWidth: 16
                    }}
                  >
                    {optionLabel}.
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: isCorrect ? 'success.dark' : 'text.secondary',
                      fontSize: '0.875rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {option}
                  </Typography>
                </Box>
              );
            })}
            {item.questionType === 'single_choice' && options.length > 4 && (
              <Typography variant="caption" color="text.disabled" sx={{ pl: 1, mt: 0.5, display: 'block' }}>
                ... +{options.length - 4} {t('eval.moreOptions')}
              </Typography>
            )}
          </Box>
        )}

        {/* 非选择题且非判断题答案 */}
        {item.questionType !== 'single_choice' &&
          item.questionType !== 'multiple_choice' &&
          item.questionType !== 'true_false' &&
          correctAnswer && (
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                bgcolor: 'background.paper',
                border: '1px dashed',
                borderColor: 'divider',
                mb: 2,
                flex: 1
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                {t('eval.answer')}:
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  display: '-webkit-box',
                  WebkitLineClamp: 4,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}
              >
                {correctAnswer}
              </Typography>
            </Box>
          )}

        <Divider sx={{ my: 1.5, opacity: 0.6 }} />

        {/* 底部元信息 */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
          {item.chunks ? (
            <Tooltip title={item.chunks.name || item.chunks.fileName}>
              <Chip
                label={item.chunks.name || item.chunks.fileName}
                size="small"
                variant="outlined"
                sx={{
                  fontSize: 11,
                  height: 22,
                  maxWidth: 140,
                  borderColor: 'divider',
                  color: 'text.secondary'
                }}
              />
            </Tooltip>
          ) : (
            <Box />
          )}

          {item.tags && (
            <Tooltip title={item.tags}>
              <Box sx={{ display: 'flex', gap: 0.5, overflow: 'hidden', maxWidth: 120 }}>
                {item.tags
                  .split(/[,，]/)
                  .slice(0, 2)
                  .map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      size="small"
                      sx={{
                        fontSize: 11,
                        height: 22,
                        bgcolor: alpha(theme.palette.info.main, 0.08),
                        color: 'info.dark',
                        maxWidth: 80
                      }}
                    />
                  ))}
                {item.tags.split(/[,，]/).length > 2 && (
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11, alignSelf: 'center' }}>
                    +{item.tags.split(/[,，]/).length - 2}
                  </Typography>
                )}
              </Box>
            </Tooltip>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
