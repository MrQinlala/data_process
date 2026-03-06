'use client';

import React, { useState } from 'react';
import {
  Box,
  Chip,
  Typography,
  useTheme,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Tooltip
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { useSetAtom } from 'jotai';
import { modelConfigListAtom, selectedModelInfoAtom } from '@/lib/store';
import { toast } from 'sonner';
import axios from 'axios';

// Icons
import FolderIcon from '@mui/icons-material/Folder';
import CheckIcon from '@mui/icons-material/Check';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

// 样式
import * as styles from './contextBarStyles';

export default function ContextBar({ projects = [], currentProjectId, onMouseLeave }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();

  // State
  const [projectMenuAnchor, setProjectMenuAnchor] = useState(null);

  // Jotai atoms
  const setConfigList = useSetAtom(modelConfigListAtom);
  const setSelectedModelInfo = useSetAtom(selectedModelInfoAtom);

  // Get current project
  const currentProject = projects.find(p => p.id === currentProjectId);

  // Handlers
  const handleProjectMenuOpen = event => {
    event.preventDefault();
    setProjectMenuAnchor(event.currentTarget);
  };

  const handleProjectMenuClose = () => {
    setProjectMenuAnchor(null);
    // 菜单关闭时，如果提供了 onMouseLeave 回调，则调用它
    if (onMouseLeave) {
      onMouseLeave();
    }
  };

  const handleProjectChange = async newProjectId => {
    handleProjectMenuClose();

    try {
      // Fetch model config for new project
      const response = await axios.get(`/api/projects/${newProjectId}/model-config`);
      setConfigList(response.data.data);

      if (response.data.defaultModelConfigId) {
        const defaultModel = response.data.data.find(item => item.id === response.data.defaultModelConfigId);
        setSelectedModelInfo(defaultModel || null);
      } else {
        setSelectedModelInfo(null);
      }

      // Navigate to the new project's text-split page
      router.push(`/projects/${newProjectId}/text-split`);
    } catch (error) {
      console.error('Error switching project:', error);
      toast.error(t('common.error', 'Error switching project'));
    }
  };

  if (!currentProjectId || !currentProject) {
    return null;
  }

  return (
    <Paper
      elevation={0}
      component="nav"
      aria-label={t('common.contextNavigation', 'Context navigation')}
      sx={styles.getContextBarPaperStyles(theme)}
    >
      <Box sx={styles.contextBarContainerStyles}>
        {/* Project Selector */}
        <Box sx={styles.selectorContainerStyles}>
          <Typography variant="caption" sx={styles.labelTypographyStyles}>
            {t('common.project', 'Project')}:
          </Typography>
          <Tooltip
            title={currentProject?.name || t('projects.selectProject', 'Select Project')}
            placement="bottom-start"
            arrow
          >
            <Chip
              icon={<FolderIcon fontSize="small" />}
              label={
                <Box sx={styles.chipLabelBoxStyles}>
                  <Typography variant="body2" noWrap sx={styles.chipTextStyles}>
                    {currentProject?.name || t('projects.selectProject', 'Select Project')}
                  </Typography>
                  <ArrowDropDownIcon fontSize="small" sx={styles.chipArrowStyles} />
                </Box>
              }
              onClick={handleProjectMenuOpen}
              clickable
              variant="outlined"
              size="medium"
              sx={styles.getProjectChipStyles(theme)}
              aria-label={t('projects.selectProject', 'Select project')}
              aria-controls={projectMenuAnchor ? 'project-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={Boolean(projectMenuAnchor)}
            />
          </Tooltip>
        </Box>
      </Box>

      {/* Project Menu */}
      <Menu
        id="project-menu"
        anchorEl={projectMenuAnchor}
        open={Boolean(projectMenuAnchor)}
        onClose={handleProjectMenuClose}
        role="menu"
        aria-label={t('projects.projectMenu', 'Project menu')}
        PaperProps={{
          elevation: 8,
          sx: styles.getMenuPaperStyles(theme)
        }}
        transformOrigin={{ horizontal: 'left', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
        MenuListProps={{
          'aria-labelledby': 'project-selector',
          ...styles.menuListPropsStyles
        }}
      >
        <Typography variant="caption" sx={styles.menuHeaderTypographyStyles}>
          {t('projects.allProjects', 'All Projects')}
        </Typography>
        {projects.map((project, index) => (
          <MenuItem
            key={project.id}
            onClick={() => handleProjectChange(project.id)}
            selected={project.id === currentProjectId}
            role="menuitem"
            sx={styles.getMenuItemStyles(theme)}
          >
            <ListItemIcon sx={styles.menuItemIconStyles}>
              {project.id === currentProjectId ? (
                <CheckIcon fontSize="small" color="primary" />
              ) : (
                <FolderIcon fontSize="small" />
              )}
            </ListItemIcon>
            <ListItemText
              primary={project.name}
              primaryTypographyProps={styles.getMenuItemTextPrimaryProps(project.id === currentProjectId)}
            />
          </MenuItem>
        ))}
      </Menu>
    </Paper>
  );
}
