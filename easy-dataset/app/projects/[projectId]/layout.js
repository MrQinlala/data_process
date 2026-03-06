'use client';

import Navbar from '@/components/Navbar/index';
import { useState, useEffect } from 'react';
import { Box, CircularProgress, Typography, Button } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useSetAtom } from 'jotai';
import { modelConfigListAtom, selectedModelInfoAtom } from '@/lib/store';

export default function ProjectLayout({ children, params }) {
  const router = useRouter();
  const { projectId } = params;
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [t] = useTranslation();
  const setModelConfigList = useSetAtom(modelConfigListAtom);
  const setSelectedModelInfo = useSetAtom(selectedModelInfoAtom);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [projectsResponse, projectResponse, modelConfigResponse] = await Promise.all([
        fetch('/api/projects'),
        fetch(`/api/projects/${projectId}`),
        fetch(`/api/projects/${projectId}/model-config`)
      ]);

      if (!projectsResponse.ok) {
        throw new Error(t('projects.fetchFailed'));
      }
      const projectsData = await projectsResponse.json();
      setProjects(projectsData);

      if (!projectResponse.ok) {
        if (projectResponse.status === 404) {
          router.push('/');
          return;
        }
        throw new Error('Failed to load project details');
      }
      const projectData = await projectResponse.json();
      setCurrentProject(projectData);

      if (modelConfigResponse.ok) {
        const modelConfigData = await modelConfigResponse.json();
        const modelList = Array.isArray(modelConfigData?.data) ? modelConfigData.data : [];
        setModelConfigList(modelList);
        if (modelConfigData?.defaultModelConfigId) {
          const defaultModel = modelList.find(item => item.id === modelConfigData.defaultModelConfigId);
          setSelectedModelInfo(defaultModel || null);
        } else {
          setSelectedModelInfo(null);
        }
      } else {
        setModelConfigList([]);
        setSelectedModelInfo(null);
      }
    } catch (error) {
      console.error('Failed to load project data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!projectId || projectId === 'undefined') {
      router.push('/');
      return;
    }

    fetchData();
  }, [projectId, router]);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh'
        }}
      >
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading project data...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh'
        }}
      >
        <Typography color="error">
          {t('projects.fetchFailed')}: {error}
        </Typography>
        <Button variant="contained" onClick={() => router.push('/')} sx={{ mt: 2 }}>
          {t('projects.backToHome')}
        </Button>
      </Box>
    );
  }

  return (
    <>
      <Navbar projects={projects} currentProject={projectId} />
      <Box component="main" sx={{ pt: 2 }}>
        {children}
      </Box>
    </>
  );
}
