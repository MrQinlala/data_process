'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Select,
  MenuItem,
  Slider,
  TextField,
  Button,
  InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useTranslation } from 'react-i18next';

const FilterDialog = ({
  open,
  onClose,
  filterConfirmed,
  filterHasCot,
  filterIsDistill,
  filterScoreRange,
  filterCustomTag,
  filterNoteKeyword,
  filterChunkName,
  availableTags,
  onFilterConfirmedChange,
  onFilterHasCotChange,
  onFilterIsDistillChange,
  onFilterScoreRangeChange,
  onFilterCustomTagChange,
  onFilterNoteKeywordChange,
  onFilterChunkNameChange,
  onResetFilters,
  onApplyFilters
}) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{t('datasets.filtersTitle')}</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3, mt: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            {t('datasets.filterConfirmationStatus')}
          </Typography>
          <Select
            value={filterConfirmed}
            onChange={e => onFilterConfirmedChange(e.target.value)}
            fullWidth
            size="small"
            sx={{ mt: 1 }}
          >
            <MenuItem value="all">{t('datasets.filterAll')}</MenuItem>
            <MenuItem value="confirmed">{t('datasets.filterConfirmed')}</MenuItem>
            <MenuItem value="unconfirmed">{t('datasets.filterUnconfirmed')}</MenuItem>
          </Select>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            {t('datasets.filterCotStatus')}
          </Typography>
          <Select
            value={filterHasCot}
            onChange={e => onFilterHasCotChange(e.target.value)}
            fullWidth
            size="small"
            sx={{ mt: 1 }}
          >
            <MenuItem value="all">{t('datasets.filterAll')}</MenuItem>
            <MenuItem value="yes">{t('datasets.filterHasCot')}</MenuItem>
            <MenuItem value="no">{t('datasets.filterNoCot')}</MenuItem>
          </Select>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            {t('datasets.filterDistill')}
          </Typography>
          <Select
            value={filterIsDistill}
            onChange={e => onFilterIsDistillChange(e.target.value)}
            fullWidth
            size="small"
            sx={{ mt: 1 }}
          >
            <MenuItem value="all">{t('datasets.filterAll')}</MenuItem>
            <MenuItem value="yes">{t('datasets.filterDistillYes')}</MenuItem>
            <MenuItem value="no">{t('datasets.filterDistillNo')}</MenuItem>
          </Select>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            {t('datasets.filterScoreRange')}
          </Typography>
          <Box sx={{ px: 1, mt: 2 }}>
            <Slider
              value={filterScoreRange}
              onChange={(_, newValue) => onFilterScoreRangeChange(newValue)}
              valueLabelDisplay="auto"
              min={0}
              max={5}
              step={0.5}
              marks={[
                { value: 0, label: '0' },
                { value: 2.5, label: '2.5' },
                { value: 5, label: '5' }
              ]}
              sx={{ mt: 1 }}
            />
            <Typography variant="caption" color="text.secondary">
              {t('datasets.scoreRange', '{{min}} - {{max}} 分', {
                min: filterScoreRange[0],
                max: filterScoreRange[1]
              })}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            {t('datasets.filterCustomTag')}
          </Typography>
          <Select
            value={filterCustomTag}
            onChange={e => onFilterCustomTagChange(e.target.value)}
            fullWidth
            size="small"
            sx={{ mt: 1 }}
          >
            <MenuItem value="">{t('datasets.filterAll')}</MenuItem>
            {availableTags.map(tag => (
              <MenuItem key={tag} value={tag}>
                {tag}
              </MenuItem>
            ))}
          </Select>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            {t('datasets.filterNoteKeyword')}
          </Typography>
          <TextField
            value={filterNoteKeyword}
            onChange={e => onFilterNoteKeywordChange(e.target.value)}
            placeholder={t('datasets.filterNoteKeywordPlaceholder')}
            fullWidth
            size="small"
            sx={{ mt: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              )
            }}
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            {t('datasets.filterChunkName')}
          </Typography>
          <TextField
            value={filterChunkName}
            onChange={e => onFilterChunkNameChange(e.target.value)}
            placeholder={t('datasets.filterChunkNamePlaceholder')}
            fullWidth
            size="small"
            sx={{ mt: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              )
            }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onResetFilters}>{t('datasets.resetFilters')}</Button>
        <Button onClick={onApplyFilters} variant="contained">
          {t('datasets.applyFilters')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FilterDialog;
