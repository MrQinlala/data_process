'use client';

import { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  LinearProgress,
  Alert
} from '@mui/material';
import { CloudUpload as UploadIcon, Description as FileIcon, CheckCircle as CheckIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
// import { useDropzone } from 'react-dropzone';

/**
 * 文件上传步骤组件
 */
export default function FileUploadStep({ onDataLoaded, onError }) {
  const { t } = useTranslation();
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  // 健壮的CSV解析函数，支持多行字段和引号转义
  const parseCSV = text => {
    const result = [];
    const lines = [];
    let currentLine = '';
    let inQuotes = false;

    // 逐字符解析，正确处理引号内的换行符
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // 转义的引号
          currentLine += '"';
          i++; // 跳过下一个引号
        } else {
          // 切换引号状态
          inQuotes = !inQuotes;
        }
      } else if (char === '\n' && !inQuotes) {
        // 行结束（不在引号内）
        if (currentLine.trim()) {
          lines.push(currentLine);
        }
        currentLine = '';
      } else {
        currentLine += char;
      }
    }

    // 添加最后一行
    if (currentLine.trim()) {
      lines.push(currentLine);
    }

    if (lines.length < 2) {
      throw new Error('CSV文件格式不正确，至少需要标题行和一行数据');
    }

    // 解析标题行
    const headers = parseCSVLine(lines[0]);

    // 解析数据行
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      if (values.length > 0) {
        const obj = {};
        headers.forEach((header, index) => {
          obj[header] = values[index] || '';
        });
        result.push(obj);
      }
    }

    return result;
  };

  // 解析单行CSV，处理逗号分隔和引号转义
  const parseCSVLine = line => {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // 转义的引号
          current += '"';
          i++; // 跳过下一个引号
        } else {
          // 切换引号状态
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // 字段分隔符（不在引号内）
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    // 添加最后一个字段
    result.push(current.trim());

    return result;
  };

  // 检测并转换ShareGPT格式为Alpaca格式
  const convertShareGPTToAlpaca = item => {
    // 检查是否包含conversations字段且格式正确
    if (item.conversations && Array.isArray(item.conversations)) {
      const conversations = item.conversations;

      // 查找system、human、gpt消息
      let systemMessage = '';
      let instruction = '';
      let output = '';

      for (const conv of conversations) {
        if (conv.from === 'system' && conv.value) {
          systemMessage = conv.value;
        } else if (conv.from === 'human' && conv.value) {
          instruction = conv.value;
        } else if (conv.from === 'gpt' && conv.value) {
          output = conv.value;
          break; // 只取第一轮对话
        }
      }

      // 如果有system消息，将其作为instruction的前缀
      if (systemMessage && instruction) {
        instruction = `${systemMessage}\n\n${instruction}`;
      } else if (systemMessage && !instruction) {
        instruction = systemMessage;
      }

      // 转换为Alpaca格式
      return {
        instruction: instruction || '',
        input: '', // ShareGPT格式通常没有单独的input字段
        output: output || '',
        // 保留其他字段
        ...Object.fromEntries(Object.entries(item).filter(([key]) => key !== 'conversations'))
      };
    }

    return item; // 如果不是ShareGPT格式，返回原始数据
  };

  const parseFileContent = async file => {
    const text = await file.text();
    const extension = file.name.split('.').pop().toLowerCase();

    try {
      let data = [];

      if (extension === 'json') {
        const parsed = JSON.parse(text);
        data = Array.isArray(parsed) ? parsed : [parsed];
      } else if (extension === 'jsonl') {
        data = text
          .split('\n')
          .filter(line => line.trim())
          .map(line => JSON.parse(line));
      } else if (extension === 'csv') {
        // 更健壮的CSV解析，支持多行字段和引号转义
        data = parseCSV(text);
        if (data.length === 0) {
          throw new Error('CSV文件格式不正确或没有数据');
        }
      } else {
        throw new Error('不支持的文件格式');
      }

      if (data.length === 0) {
        throw new Error('文件中没有找到有效数据');
      }

      // 检测并转换ShareGPT格式为Alpaca格式
      data = data.map(convertShareGPTToAlpaca);

      // 生成预览数据（取前3条记录，每个字段值截取前100字符）
      const previewData = data.slice(0, 3).map(item => {
        const preview = {};
        Object.keys(item).forEach(key => {
          const value = String(item[key] || '');
          preview[key] = value.length > 100 ? value.substring(0, 100) + '...' : value;
        });
        return preview;
      });

      return {
        data,
        preview: previewData,
        source: {
          type: 'file',
          fileName: file.name,
          fileSize: file.size,
          totalRecords: data.length
        }
      };
    } catch (error) {
      throw new Error(`解析文件失败: ${error.message}`);
    }
  };

  const handleFileSelect = async event => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setUploading(true);

    try {
      const result = await parseFileContent(file);
      setUploadedFiles([
        {
          name: file.name,
          size: file.size,
          status: 'success'
        }
      ]);

      onDataLoaded(result.data, result.preview, result.source);
    } catch (error) {
      setUploadedFiles([
        {
          name: file.name,
          size: file.size,
          status: 'error',
          error: error.message
        }
      ]);
      onError(error.message);
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = bytes => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {t('import.uploadFile', '上传文件')}
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {t('import.supportedFormats', '支持 JSON、JSONL、CSV 格式文件')}
      </Typography>

      {/* 文件上传区域 */}
      <Paper
        sx={{
          p: 4,
          textAlign: 'center',
          cursor: 'pointer',
          border: '2px dashed',
          borderColor: 'divider',
          backgroundColor: 'background.paper',
          transition: 'all 0.2s ease',
          mb: 3,
          '&:hover': {
            borderColor: 'primary.main',
            backgroundColor: 'action.hover'
          }
        }}
        onClick={() => document.getElementById('file-upload-input').click()}
      >
        <input
          id="file-upload-input"
          type="file"
          accept=".json,.jsonl,.csv"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        <UploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          {t('import.dragDropFile', '拖拽文件到此处或点击选择文件')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('import.maxFileSize', '最大文件大小: 50MB')}
        </Typography>
      </Paper>

      {/* 上传进度 */}
      {uploading && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" gutterBottom>
            {t('import.processingFile', '正在处理文件...')}
          </Typography>
          <LinearProgress />
        </Box>
      )}

      {/* 已上传文件列表 */}
      {uploadedFiles.length > 0 && (
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            {t('import.uploadedFiles', '已上传文件')}
          </Typography>
          <List>
            {uploadedFiles.map((file, index) => (
              <ListItem key={index} sx={{ px: 0 }}>
                <ListItemIcon>
                  {file.status === 'success' ? <CheckIcon color="success" /> : <FileIcon color="error" />}
                </ListItemIcon>
                <ListItemText
                  primary={file.name}
                  secondary={file.status === 'success' ? `${formatFileSize(file.size)}` : file.error}
                />
              </ListItem>
            ))}
          </List>

          {uploadedFiles.some(f => f.status === 'error') && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {t('import.uploadError', '文件上传失败，请检查文件格式是否正确')}
            </Alert>
          )}
        </Box>
      )}
    </Box>
  );
}
