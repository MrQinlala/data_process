'use client';

import React from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import GitHubIcon from '@mui/icons-material/GitHub';
import BarChartIcon from '@mui/icons-material/BarChart';
import LanguageSwitcher from '../LanguageSwitcher';
import UpdateChecker from '../UpdateChecker';
import TaskIcon from '../TaskIcon';
import ModelSelect from '../ModelSelect';
import * as styles from './styles';

/**
 * ActionButtons 组件
 * 右侧操作区按钮：语言切换、主题切换、文档、GitHub、更新检查
 */
export default function ActionButtons({
  theme,
  resolvedTheme,
  toggleTheme,
  isProjectDetail,
  currentProject,
  onActionAreaEnter
}) {
  const { t, i18n } = useTranslation();
  const isZhLanguage = String(i18n.language || '')
    .toLowerCase()
    .startsWith('zh');

  return (
    <Box sx={styles.actionAreaStyles} onMouseEnter={onActionAreaEnter}>
      {isProjectDetail && <ModelSelect projectId={currentProject} />}
      {isProjectDetail && <TaskIcon theme={theme} projectId={currentProject} />}

      {/* Monitoring Dashboard - Only visible on Home page */}
      {!isProjectDetail && (
        <Tooltip title={t('monitoring.title', 'Resource Monitoring')}>
          <IconButton component="a" href="/monitoring" size="medium" sx={styles.getIconButtonStyles(theme)}>
            <BarChartIcon />
          </IconButton>
        </Tooltip>
      )}

      {/* Language Switcher - Always visible */}
      <LanguageSwitcher />

      {/* Theme Toggle - Always visible */}
      <Tooltip
        title={
          resolvedTheme === 'dark'
            ? t('theme.switchToLight', 'Switch to light mode')
            : t('theme.switchToDark', 'Switch to dark mode')
        }
      >
        <IconButton
          onClick={toggleTheme}
          size="medium"
          aria-label={
            resolvedTheme === 'dark'
              ? t('theme.switchToLight', 'Switch to light mode')
              : t('theme.switchToDark', 'Switch to dark mode')
          }
          sx={styles.getIconButtonStyles(theme)}
        >
          {resolvedTheme === 'dark' ? (
            <LightModeOutlinedIcon fontSize="small" />
          ) : (
            <DarkModeOutlinedIcon fontSize="small" />
          )}
        </IconButton>
      </Tooltip>

      {/* Documentation - Hide below xl */}
      <Tooltip title={t('documentation')}>
        <IconButton
          component="a"
          href={isZhLanguage ? 'https://docs.easy-dataset.com/' : 'https://docs.easy-dataset.com/ed/en'}
          target="_blank"
          rel="noopener noreferrer"
          size="medium"
          sx={styles.getIconButtonStyles(theme)}
        >
          <HelpOutlineIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      {/* GitHub - Hide at larger tablet screens and below */}
      <Tooltip title={t('common.visitGitHub', 'View on GitHub')}>
        <IconButton
          component="a"
          href="https://github.com/ConardLi/easy-dataset"
          target="_blank"
          rel="noopener noreferrer"
          size="medium"
          aria-label={t('common.visitGitHub', 'Open GitHub repository')}
          sx={styles.getIconButtonStyles(theme)}
        >
          <GitHubIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      {/* Update Checker - Hide below xl */}
      <Box sx={{ display: { xs: 'none', xl: 'flex' } }}>
        <UpdateChecker />
      </Box>
    </Box>
  );
}
