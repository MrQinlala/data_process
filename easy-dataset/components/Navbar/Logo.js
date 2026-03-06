'use client';

import React from 'react';
import { Box, Typography, Tooltip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import * as styles from './styles';

/**
 * Logo 组件
 * 显示应用 Logo 和标题，支持点击跳转到首页
 */
export default function Logo({ theme }) {
  const { t } = useTranslation();

  return (
    <Tooltip title={t('common.goHome', 'Go to Home')} placement="bottom">
      <Box
        component="a"
        href="/"
        role="link"
        aria-label={t('common.goToHomePage', 'Go to home page')}
        tabIndex={0}
        sx={styles.getLogoLinkStyles(theme)}
        onClick={e => {
          e.preventDefault();
          window.location.href = '/';
        }}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            window.location.href = '/';
          }
        }}
      >
        <Box component="img" src="/imgs/logo.svg" alt="Easy Dataset Logo" sx={styles.logoImageStyles} />
        <Typography variant="h6" sx={styles.getLogoTextStyles(theme)}>
          Easy DataSet
        </Typography>
      </Box>
    </Tooltip>
  );
}
