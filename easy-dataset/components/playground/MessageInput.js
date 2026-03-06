'use client';

import React, { useState } from 'react';
import { Box, TextField, Button, IconButton, Badge, Tooltip } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ImageIcon from '@mui/icons-material/Image';
import CancelIcon from '@mui/icons-material/Cancel';
import { useTheme } from '@mui/material/styles';
import { playgroundStyles } from '@/styles/playground';
import { useTranslation } from 'react-i18next';

const MessageInput = ({
  userInput,
  handleInputChange,
  handleSendMessage,
  loading,
  selectedModels,
  uploadedImage,
  handleImageUpload,
  handleRemoveImage,
  availableModels
}) => {
  const theme = useTheme();
  const styles = playgroundStyles(theme);
  const { t } = useTranslation();

  const isDisabled = Object.values(loading).some(value => value) || selectedModels.length === 0;
  const isSendDisabled = isDisabled || (!userInput.trim() && !uploadedImage);

  // 检查是否有视觉模型被选中
  const hasVisionModel = selectedModels.some(modelId => {
    const model = availableModels.find(m => m.id === modelId);
    return model && model.type === 'vision';
  });

  return (
    <Box sx={styles.inputContainer}>
      {uploadedImage && (
        <Box sx={{ position: 'relative', mb: 1, display: 'inline-block', maxWidth: '100%' }}>
          <Badge
            badgeContent={
              <IconButton
                size="small"
                onClick={handleRemoveImage}
                sx={{ bgcolor: 'rgba(0, 0, 0, 0.4)', '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.6)' } }}
              >
                <CancelIcon fontSize="small" sx={{ color: '#fff' }} />
              </IconButton>
            }
            sx={{ width: '100%' }}
            overlap="rectangular"
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <img
              src={uploadedImage}
              alt="上传图片"
              style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '4px' }}
            />
          </Badge>
        </Box>
      )}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%' }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder={t('playground.inputMessage')}
          value={userInput}
          onChange={handleInputChange}
          disabled={isDisabled}
          onKeyPress={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          multiline
          maxRows={4}
        />
        {hasVisionModel && (
          <Tooltip title={t('playground.uploadImage')}>
            <span>
              <IconButton color="primary" component="label" disabled={isDisabled} sx={{ ml: 1, mr: 1 }}>
                <input hidden accept="image/*" type="file" onChange={handleImageUpload} />
                <ImageIcon />
              </IconButton>
            </span>
          </Tooltip>
        )}
        <Button
          variant="contained"
          color="primary"
          endIcon={<SendIcon />}
          onClick={handleSendMessage}
          disabled={isSendDisabled}
          sx={styles.sendButton}
        >
          {t('playground.send')}
        </Button>
      </Box>
    </Box>
  );
};

export default MessageInput;
