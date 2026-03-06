'use client';

import { Chip } from '@mui/material';
import { Star as StarIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { getRatingConfigI18n, formatScore } from '@/components/datasets/utils/ratingUtils';

/**
 * 评分展示组件
 * @param {number} score - 评分值
 */
const RatingChip = ({ score }) => {
  const { t } = useTranslation();
  const config = getRatingConfigI18n(score, t);

  return (
    <Chip
      icon={<StarIcon sx={{ fontSize: '14px !important' }} />}
      label={`${formatScore(score)} ${config.label}`}
      size="small"
      sx={{
        backgroundColor: config.backgroundColor,
        color: config.color,
        fontWeight: 'medium',
        '& .MuiChip-icon': {
          color: config.color
        }
      }}
    />
  );
};

export default RatingChip;
