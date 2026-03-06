'use client';

import { Box, Paper, IconButton, InputBase, Select, MenuItem, Button, Badge } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import { useTranslation } from 'react-i18next';

const SearchBar = ({
  searchQuery,
  searchField,
  onSearchQueryChange,
  onSearchFieldChange,
  onMoreFiltersClick,
  activeFilterCount = 0
}) => {
  const { t } = useTranslation();

  return (
    <Box sx={{ display: 'flex', gap: 2 }}>
      <Paper
        component="form"
        sx={{
          p: '2px 4px',
          display: 'flex',
          alignItems: 'center',
          width: 400,
          borderRadius: 2
        }}
      >
        <IconButton sx={{ p: '10px' }} aria-label="search">
          <SearchIcon />
        </IconButton>
        <InputBase
          sx={{ ml: 1, flex: 1 }}
          placeholder={t('datasets.searchPlaceholder')}
          value={searchQuery}
          onChange={e => onSearchQueryChange(e.target.value)}
          endAdornment={
            <Select
              value={searchField}
              onChange={e => onSearchFieldChange(e.target.value)}
              variant="standard"
              sx={{
                minWidth: 90,
                '& .MuiInput-underline:before': { borderBottom: 'none' },
                '& .MuiInput-underline:after': { borderBottom: 'none' },
                '& .MuiInput-underline:hover:not(.Mui-disabled):before': { borderBottom: 'none' }
              }}
              disableUnderline
            >
              <MenuItem value="question">{t('datasets.fieldQuestion')}</MenuItem>
              <MenuItem value="answer">{t('datasets.fieldAnswer')}</MenuItem>
              <MenuItem value="cot">{t('datasets.fieldCOT')}</MenuItem>
              <MenuItem value="questionLabel">{t('datasets.fieldLabel')}</MenuItem>
            </Select>
          }
        />
      </Paper>
      <Badge badgeContent={activeFilterCount} color="error" overlap="circular">
        <Button variant="outlined" onClick={onMoreFiltersClick} startIcon={<FilterListIcon />} sx={{ borderRadius: 2 }}>
          {t('datasets.moreFilters')}
        </Button>
      </Badge>
    </Box>
  );
};

export default SearchBar;
