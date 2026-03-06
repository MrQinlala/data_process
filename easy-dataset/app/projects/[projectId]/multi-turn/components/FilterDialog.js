'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { useTranslation } from 'react-i18next';

/**
 * 筛选对话框组件
 * @param {boolean} open - 对话框开启状态
 * @param {function} onClose - 关闭回调
 * @param {object} filters - 筛选条件
 * @param {function} onFiltersChange - 筛选条件变化回调
 * @param {function} onReset - 重置回调
 * @param {function} onApply - 应用回调
 */
const FilterDialog = ({ open, onClose, filters, onFiltersChange, onReset, onApply }) => {
  const { t } = useTranslation();

  const handleFilterChange = (field, value) => {
    onFiltersChange({ ...filters, [field]: value });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('datasets.filtersTitle')}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            label={t('settings.multiTurnRoleA')}
            value={filters.roleA}
            onChange={e => handleFilterChange('roleA', e.target.value)}
            fullWidth
          />
          <TextField
            label={t('settings.multiTurnRoleB')}
            value={filters.roleB}
            onChange={e => handleFilterChange('roleB', e.target.value)}
            fullWidth
          />
          <TextField
            label={t('datasets.conversationScenario')}
            value={filters.scenario}
            onChange={e => handleFilterChange('scenario', e.target.value)}
            fullWidth
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label={t('datasets.minScore')}
              type="number"
              inputProps={{ min: 0, max: 5, step: 0.1 }}
              value={filters.scoreMin}
              onChange={e => handleFilterChange('scoreMin', e.target.value)}
              fullWidth
            />
            <TextField
              label={t('datasets.maxScore')}
              type="number"
              inputProps={{ min: 0, max: 5, step: 0.1 }}
              value={filters.scoreMax}
              onChange={e => handleFilterChange('scoreMax', e.target.value)}
              fullWidth
            />
          </Box>
          <FormControl fullWidth>
            <InputLabel>{t('datasets.filterConfirmationStatus')}</InputLabel>
            <Select
              value={filters.confirmed}
              onChange={e => handleFilterChange('confirmed', e.target.value)}
              label={t('datasets.filterConfirmationStatus')}
            >
              <MenuItem value="">{t('datasetSquare.categories.all')}</MenuItem>
              <MenuItem value="true">{t('datasets.confirmed')}</MenuItem>
              <MenuItem value="false">{t('datasets.unconfirmed')}</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onReset} sx={{ borderRadius: 2 }}>
          {t('datasets.resetFilters')}
        </Button>
        <Button onClick={onClose} sx={{ borderRadius: 2 }}>
          {t('common.cancel')}
        </Button>
        <Button variant="contained" onClick={onApply} sx={{ borderRadius: 2 }}>
          {t('datasets.applyFilters')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FilterDialog;
