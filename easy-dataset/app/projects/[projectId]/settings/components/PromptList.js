import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Tabs, Tab, Typography, Chip } from '@mui/material';
import { shouldShowPrompt } from './promptUtils';

/**
 * 左侧提示词列表组件
 */
const PromptList = ({
  currentCategory,
  currentCategoryConfig,
  selectedPrompt,
  currentLanguage,
  isCustomized,
  onPromptSelect
}) => {
  const { t } = useTranslation();

  if (!currentCategoryConfig?.prompts) {
    return (
      <Typography variant="body2" color="text.secondary" align="center">
        {t('settings.prompts.noPromptsAvailable')}
      </Typography>
    );
  }

  return (
    <Tabs
      orientation="vertical"
      value={selectedPrompt || ''}
      onChange={(e, newValue) => onPromptSelect(newValue)}
      variant="scrollable"
      scrollButtons="auto"
      sx={{
        borderRight: 1,
        borderColor: 'divider',
        '& .MuiTabs-indicator': {
          left: 0,
          right: 'auto'
        },
        '& .MuiTab-root': {
          alignItems: 'flex-start',
          textAlign: 'left'
        }
      }}
    >
      {currentCategoryConfig &&
        Object.entries(currentCategoryConfig.prompts).map(([promptKey, promptConfig]) => {
          if (!shouldShowPrompt(promptKey, currentLanguage)) return null;

          const customized = isCustomized(promptKey);

          return (
            <Tab
              key={promptKey}
              value={promptKey}
              label={
                <Box sx={{ textAlign: 'left', width: '100%' }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {promptConfig.name}
                  </Typography>
                  {customized && (
                    <Chip label={t('settings.prompts.customized')} color="primary" size="small" sx={{ mt: 0.5 }} />
                  )}
                </Box>
              }
              sx={{
                alignItems: 'flex-start',
                minHeight: 60,
                px: 2,
                justifyContent: 'flex-start',
                width: '100%'
              }}
            />
          );
        })}
    </Tabs>
  );
};

export default PromptList;
