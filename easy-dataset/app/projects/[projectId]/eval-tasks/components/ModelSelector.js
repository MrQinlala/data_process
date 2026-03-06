'use client';

import {
  Box,
  Typography,
  Checkbox,
  FormHelperText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ListItemText,
  OutlinedInput,
  Chip
} from '@mui/material';
import { useTranslation } from 'react-i18next';

export default function ModelSelector({ models, selectedModels, onSelectionChange, error }) {
  const { t } = useTranslation();

  const getModelKey = model => `${model.providerId}::${model.modelId}`;

  const handleChange = event => {
    const {
      target: { value }
    } = event;
    // On autofill we get a stringified value.
    onSelectionChange(typeof value === 'string' ? value.split(',') : value);
  };

  const getModelLabel = modelKey => {
    const model = models.find(m => getModelKey(m) === modelKey);
    if (!model) return modelKey;
    return `${model.providerName || model.providerId} / ${model.modelName || model.modelId}`;
  };

  return (
    <Box sx={{ mb: 3 }}>
      <FormControl fullWidth error={!!error} size="small">
        <InputLabel id="model-selector-label">{t('evalTasks.selectModels')} *</InputLabel>
        <Select
          labelId="model-selector-label"
          multiple
          value={selectedModels}
          onChange={handleChange}
          input={<OutlinedInput label={`${t('evalTasks.selectModels')} *`} />}
          renderValue={selected => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map(value => (
                <Chip key={value} label={getModelLabel(value)} size="small" />
              ))}
            </Box>
          )}
          MenuProps={{
            PaperProps: {
              style: {
                maxHeight: 300,
                width: 250
              }
            }
          }}
        >
          {models.length === 0 ? (
            <MenuItem disabled value="">
              <Typography variant="body2" color="text.secondary">
                {t('evalTasks.noModelsAvailable')}
              </Typography>
            </MenuItem>
          ) : (
            models.map(model => {
              const modelKey = getModelKey(model);
              return (
                <MenuItem key={modelKey} value={modelKey}>
                  <Checkbox checked={selectedModels.includes(modelKey)} />
                  <ListItemText
                    primary={`${model.providerName || model.providerId} / ${model.modelName || model.modelId}`}
                  />
                </MenuItem>
              );
            })
          )}
        </Select>
        <FormHelperText>{error || t('evalTasks.selectModelsHint')}</FormHelperText>
      </FormControl>
    </Box>
  );
}
