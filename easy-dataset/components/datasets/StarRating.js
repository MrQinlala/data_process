'use client';

import { useState } from 'react';
import { Box, Rating, Typography } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import { useTranslation } from 'react-i18next';

/**
 * 五星评分组件
 */
export default function StarRating({ value = 0, onChange, readOnly = false, size = 'medium', showLabel = true }) {
  const { t } = useTranslation();
  const [hover, setHover] = useState(-1);

  const labels = {
    0.5: t('rating.veryPoor', '很差'),
    1: t('rating.poor', '差'),
    1.5: t('rating.belowAverage', '偏差'),
    2: t('rating.fair', '一般'),
    2.5: t('rating.average', '中等'),
    3: t('rating.good', '良好'),
    3.5: t('rating.veryGood', '很好'),
    4: t('rating.excellent', '优秀'),
    4.5: t('rating.outstanding', '杰出'),
    5: t('rating.perfect', '完美')
  };

  const getLabelText = value => {
    return `${value} Star${value !== 1 ? 's' : ''}, ${labels[value]}`;
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Rating
        name="dataset-rating"
        value={value}
        precision={0.5}
        getLabelText={getLabelText}
        onChange={(event, newValue) => {
          if (!readOnly && onChange) {
            onChange(newValue || 0);
          }
        }}
        onChangeActive={(event, newHover) => {
          if (!readOnly) {
            setHover(newHover);
          }
        }}
        readOnly={readOnly}
        size={size}
        icon={<StarIcon fontSize="inherit" />}
        emptyIcon={<StarIcon fontSize="inherit" />}
        sx={{
          '& .MuiRating-iconFilled': {
            color: '#ffc107'
          },
          '& .MuiRating-iconHover': {
            color: '#ffb300'
          }
        }}
      />
      {showLabel && (
        <Typography variant="body2" color="text.secondary" sx={{ minWidth: 60 }}>
          {labels[hover !== -1 ? hover : value] || (value === 0 ? t('rating.unrated', '未评分') : '')}
        </Typography>
      )}
    </Box>
  );
}
