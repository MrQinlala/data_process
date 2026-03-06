'use client';

import { Box, Typography, Card, CardContent, Chip, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';

/**
 * 多轮对话内容展示和编辑组件
 */
export default function ConversationContent({ messages, editMode, onMessageChange, conversation }) {
  const { t } = useTranslation();

  // 获取角色显示信息
  const getRoleDisplay = role => {
    switch (role) {
      case 'system':
        return { name: t('datasets.system'), color: 'default' };
      case 'user':
        return { name: conversation?.roleA || t('datasets.user'), color: 'primary' };
      case 'assistant':
        return { name: conversation?.roleB || t('datasets.assistant'), color: 'secondary' };
      default:
        return { name: role, color: 'default' };
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {t('datasets.conversationContent')}
      </Typography>

      <Box sx={{ maxHeight: editMode ? 'none' : '70vh', overflowY: 'auto' }}>
        {messages.map((message, index) => {
          const roleInfo = getRoleDisplay(message.role);
          return (
            <Box key={index} sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Chip label={roleInfo.name} color={roleInfo.color} size="small" sx={{ fontSize: '0.75rem' }} />
                {message.role !== 'system' && (
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                    {t('datasets.round', { round: Math.floor((index + 1) / 2) + 1 })}
                  </Typography>
                )}
              </Box>
              <Card variant="outlined" sx={{ mb: 1 }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  {editMode ? (
                    <TextField
                      fullWidth
                      multiline
                      minRows={3}
                      maxRows={10}
                      value={message.content}
                      onChange={e => onMessageChange && onMessageChange(index, e.target.value)}
                      variant="outlined"
                      size="small"
                      sx={{
                        '& .MuiInputBase-input': {
                          fontFamily: 'inherit',
                          fontSize: '0.875rem',
                          lineHeight: 1.5
                        }
                      }}
                    />
                  ) : (
                    <Typography
                      variant="body2"
                      component="pre"
                      sx={{
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        fontFamily: 'inherit',
                        lineHeight: 1.6,
                        margin: 0
                      }}
                    >
                      {message.content}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
