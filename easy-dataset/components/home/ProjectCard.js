'use client';

import {
  Card,
  Box,
  CardActionArea,
  CardContent,
  Typography,
  Avatar,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon
} from '@mui/material';
import Link from 'next/link';
import { styles } from '@/styles/home';
import { useTheme, alpha } from '@mui/material/styles';
import DataObjectIcon from '@mui/icons-material/DataObject';
import DeleteIcon from '@mui/icons-material/Delete';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import TokenIcon from '@mui/icons-material/Token';
import AssessmentIcon from '@mui/icons-material/Assessment';
import QuizIcon from '@mui/icons-material/Quiz';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

/**
 * 统计项组件
 */
const StatItem = ({ icon: Icon, count, label, color, isToken }) => {
  const theme = useTheme();

  // 格式化数字
  const displayCount = isToken ? (count || 0).toLocaleString() : count || 0;

  return (
    <Box sx={styles.statItem(theme)}>
      <Box sx={styles.statIconBox(theme, color)}>
        <Icon sx={{ fontSize: 18 }} />
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Typography variant="subtitle2" fontWeight="700" sx={{ lineHeight: 1 }}>
          {displayCount}
        </Typography>
        <Typography variant="caption" color="text.secondary" noWrap sx={{ fontSize: '0.7rem' }}>
          {label}
        </Typography>
      </Box>
    </Box>
  );
};

/**
 * 项目卡片组件
 * @param {Object} props - 组件属性
 * @param {Object} props.project - 项目数据
 * @param {Function} props.onDeleteClick - 删除按钮点击事件处理函数
 */
export default function ProjectCard({ project, onDeleteClick }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [processingId, setProcessingId] = useState(false);

  // 菜单状态
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  // 打开项目目录
  const handleOpenDirectory = async event => {
    event.stopPropagation();
    event.preventDefault();

    if (processingId) return;

    try {
      setProcessingId(true);

      const response = await fetch('/api/projects/open-directory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ projectId: project.id })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || t('migration.openDirectoryFailed'));
      }

      // 成功打开目录，不需要特别处理
    } catch (error) {
      console.error('打开目录错误:', error);
      alert(error.message);
    } finally {
      setProcessingId(false);
    }
  };

  // 处理菜单打开
  const handleMenuClick = event => {
    event.stopPropagation();
    event.preventDefault();
    setAnchorEl(event.currentTarget);
  };

  // 处理菜单关闭
  const handleMenuClose = event => {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    setAnchorEl(null);
  };

  // 处理打开目录点击
  const handleOpenDirectoryClick = event => {
    handleMenuClose(event);
    handleOpenDirectory(event);
  };

  // 处理删除点击
  const handleDeleteClick = event => {
    handleMenuClose(event);
    onDeleteClick(event, project);
  };

  return (
    <Card sx={styles.projectCard(theme)}>
      <Link
        href={`/projects/${project.id}`}
        passHref
        style={{ textDecoration: 'none', color: 'inherit', height: '100%' }}
      >
        <CardActionArea component="div" sx={{ height: '100%' }}>
          <CardContent sx={styles.projectCardContent}>
            {/* 头部：Avatar + Title + Menu */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', overflow: 'hidden', flex: 1 }}>
                <Avatar
                  sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                    width: 40,
                    height: 40,
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    borderRadius: '10px'
                  }}
                >
                  {project.name.charAt(0).toUpperCase()}
                </Avatar>
                <Box sx={{ overflow: 'hidden', flex: 1 }}>
                  <Typography variant="h6" sx={styles.projectTitle}>
                    {project.name}
                  </Typography>
                  <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.7rem' }}>
                    ID: {project.id}
                  </Typography>
                </Box>
              </Box>
              <IconButton
                size="small"
                onClick={handleMenuClick}
                sx={{
                  color: 'text.secondary',
                  padding: '4px',
                  '&:hover': { color: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.1) }
                }}
              >
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Box>

            {/* 描述 */}
            <Typography variant="body2" sx={styles.projectDescription}>
              {project.description || t('projects.noDescription', { defaultValue: '暂无描述' })}
            </Typography>

            {/* 统计数据 */}
            <Box sx={styles.statsContainer}>
              <StatItem
                icon={QuizIcon}
                count={project._count.Questions}
                label={t('projects.questions')}
                color="primary"
              />
              <StatItem
                icon={DataObjectIcon}
                count={(project._count.ImageDatasets || 0) + (project._count.Datasets || 0)}
                label={t('projects.datasets')}
                color="secondary"
              />
              <StatItem
                icon={AssessmentIcon}
                count={project._count.EvalDatasets}
                label={t('projects.evalDatasets')}
                color="info"
              />
              <StatItem
                icon={TokenIcon}
                count={project.totalTokens}
                label={t('projects.tokens')}
                color="success"
                isToken
              />
            </Box>
          </CardContent>
        </CardActionArea>
      </Link>

      {/* 操作菜单 */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        onClick={e => {
          e.preventDefault();
          e.stopPropagation();
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          elevation: 3,
          sx: {
            borderRadius: '12px',
            minWidth: 160,
            mt: 0.5
          }
        }}
      >
        <MenuItem onClick={handleOpenDirectoryClick}>
          <ListItemIcon>
            <FolderOpenIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="body2">{t('projects.openDirectory')}</Typography>
        </MenuItem>

        <Divider sx={{ my: 0.5, opacity: 0.5 }} />

        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <Typography variant="body2">{t('common.delete')}</Typography>
        </MenuItem>
      </Menu>
    </Card>
  );
}
