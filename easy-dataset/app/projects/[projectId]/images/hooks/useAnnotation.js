import { useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

// 深度遍历 JSON，将所有值设为空字符串
function clearJsonValues(obj) {
  if (Array.isArray(obj)) {
    return obj.map(item => clearJsonValues(item));
  } else if (obj !== null && typeof obj === 'object') {
    const cleared = {};
    for (const key in obj) {
      cleared[key] = clearJsonValues(obj[key]);
    }
    return cleared;
  } else {
    return ''; // 所有基础类型值都变为空字符串
  }
}

export function useAnnotation(projectId, onSuccess, onFindNextImage) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [answer, setAnswer] = useState('');

  // 打开标注对话框
  const openAnnotation = async (image, template = null) => {
    setLoading(true);
    try {
      // 获取图片详情，包括已标注和未标注的问题
      const response = await axios.get(`/api/projects/${projectId}/images/${image.id}`);
      if (response.data.success) {
        const imageDetail = response.data.data;
        setCurrentImage(imageDetail);

        // 如果没有指定模板，尝试选择第一个未标注的问题
        if (!template) {
          if (imageDetail.unansweredQuestions?.length > 0) {
            template = imageDetail.unansweredQuestions[0];
          }
        }

        setSelectedTemplate(template);

        // 根据问题类型初始化答案
        let initialAnswer = '';
        if (template?.answerType === 'label') {
          initialAnswer = [];
        } else if (template?.answerType === 'custom_format' && template?.customFormat) {
          // 为自定义格式提供默认值（所有字段值清空）
          try {
            let templateJson;
            if (typeof template.customFormat === 'string') {
              // 如果customFormat是字符串，尝试解析为JSON
              templateJson = JSON.parse(template.customFormat);
            } else {
              // 如果customFormat已经是对象，直接使用
              templateJson = template.customFormat;
            }
            // 深度遍历，将所有字段值清空
            const clearedJson = clearJsonValues(templateJson);
            initialAnswer = JSON.stringify(clearedJson, null, 2);
          } catch (error) {
            // 如枟解析失败，提供一个空的JSON对象
            initialAnswer = '{}';
          }
        }

        setAnswer(initialAnswer);
        setOpen(true);
      } else {
        toast.error(t('images.loadImageDetailFailed', { defaultValue: '加载图片详情失败' }));
      }
    } catch (error) {
      console.error('获取图片详情失败:', error);
      toast.error(t('images.loadImageDetailFailed', { defaultValue: '加载图片详情失败' }));
    } finally {
      setLoading(false);
    }
  };

  // 关闭对话框
  const closeAnnotation = () => {
    setOpen(false);
    setCurrentImage(null);
    setSelectedTemplate(null);
    setAnswer('');
  };

  // 刷新当前图片的问题列表（创建问题后调用）
  const refreshCurrentImage = async () => {
    if (!currentImage) return;

    try {
      const response = await axios.get(`/api/projects/${projectId}/images/${currentImage.id}`);
      if (response.data.success) {
        const imageDetail = response.data.data;
        // 更新当前图片数据
        setCurrentImage(imageDetail);
        return imageDetail;
      }
    } catch (error) {
      console.error('刷新图片详情失败:', error);
    }
  };

  // 查找下一个未标注的问题
  const findNextUnansweredQuestion = async () => {
    // 重新获取图片详情，获取最新的问题列表
    try {
      const response = await axios.get(`/api/projects/${projectId}/images/${currentImage.id}`);
      if (response.data.success) {
        const imageDetail = response.data.data;

        // 更新当前图片数据
        setCurrentImage(imageDetail);

        // 返回第一个未标注的问题
        if (imageDetail.unansweredQuestions?.length > 0) {
          return imageDetail.unansweredQuestions[0];
        }

        return null;
      }
    } catch (error) {
      console.error('获取下一个问题失败:', error);
      return null;
    }
  };

  // 保存标注
  const saveAnnotation = async (continueNext = false) => {
    if (!currentImage) {
      toast.error(t('images.noImageSelected', { defaultValue: '未选择图片' }));
      return;
    }

    if (!selectedTemplate) {
      toast.error(t('images.noTemplateSelected', { defaultValue: '请选择问题' }));
      return;
    }

    // 验证答案
    if (!answer || (Array.isArray(answer) && answer.length === 0)) {
      toast.error(t('images.answerRequired', { defaultValue: '请输入答案' }));
      return;
    }

    // 如果是自定义格式，验证 JSON 格式
    if (selectedTemplate.answerType === 'custom_format') {
      try {
        JSON.parse(answer);
      } catch (e) {
        toast.error(t('images.invalidJsonFormat', { defaultValue: 'JSON 格式不正确' }));
        return;
      }
    }

    console.log(999, answer);
    setSaving(true);
    try {
      const response = await axios.post(`/api/projects/${projectId}/images/annotations`, {
        imageId: currentImage.id,
        imageName: currentImage.imageName,
        questionId: selectedTemplate.id,
        question: selectedTemplate.question,
        templateId: selectedTemplate.id,
        answerType: selectedTemplate.answerType,
        answer
      });

      if (response.data.success) {
        toast.success(t('images.annotationSuccess', { defaultValue: '标注保存成功' }));

        // 触发刷新回调
        if (onSuccess) {
          onSuccess();
        }

        if (continueNext) {
          // 查找下一个未标注的问题
          const nextQuestion = await findNextUnansweredQuestion();

          if (nextQuestion) {
            // 切换到下一个问题
            setSelectedTemplate(nextQuestion);

            // 根据问题类型初始化答案
            let initialAnswer = '';
            if (nextQuestion.answerType === 'label') {
              initialAnswer = [];
            } else if (nextQuestion.answerType === 'custom_format' && nextQuestion.customFormat) {
              try {
                let templateJson;
                if (typeof nextQuestion.customFormat === 'string') {
                  templateJson = JSON.parse(nextQuestion.customFormat);
                } else {
                  templateJson = nextQuestion.customFormat;
                }
                const clearedJson = clearJsonValues(templateJson);
                initialAnswer = JSON.stringify(clearedJson, null, 2);
              } catch (error) {
                initialAnswer = '{}';
              }
            }
            setAnswer(initialAnswer);
          } else {
            // 没有更多未标注的问题了，尝试查找下一个有未标注问题的图片
            if (onFindNextImage) {
              const nextImage = await onFindNextImage();
              if (nextImage) {
                // 打开下一个图片的标注
                await openAnnotation(nextImage);
              } else {
                // 没有更多图片了
                toast.info(t('images.allImagesAnnotated', { defaultValue: '所有图片的问题都已标注完成' }));
                closeAnnotation();
              }
            } else {
              toast.info(t('images.allQuestionsAnnotated', { defaultValue: '当前图片所有问题已标注完成' }));
              closeAnnotation();
            }
          }
        } else {
          closeAnnotation();
        }
      }
    } catch (error) {
      console.error('保存标注失败:', error);
      const errorMsg = error.response?.data?.error || t('images.annotationFailed', { defaultValue: '保存标注失败' });
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  // 处理模板变更
  const handleTemplateChange = template => {
    setSelectedTemplate(template);

    // 根据新模板类型初始化答案
    let initialAnswer = '';
    if (template?.answerType === 'label') {
      initialAnswer = [];
    } else if (template?.answerType === 'custom_format' && template?.customFormat) {
      // 为自定义格式提供默认值（所有字段值清空）
      try {
        let templateJson;
        if (typeof template.customFormat === 'string') {
          // 如果customFormat是字符串，尝试解析为JSON
          templateJson = JSON.parse(template.customFormat);
        } else {
          // 如果customFormat已经是对象，直接使用
          templateJson = template.customFormat;
        }
        // 深度遍历，将所有字段值清空
        const clearedJson = clearJsonValues(templateJson);
        initialAnswer = JSON.stringify(clearedJson, null, 2);
      } catch (error) {
        // 如枟解析失败，提供一个空的JSON对象
        initialAnswer = '{}';
      }
    }

    setAnswer(initialAnswer);
  };

  return {
    open,
    saving,
    loading,
    currentImage,
    selectedTemplate,
    answer,
    setSelectedTemplate,
    setAnswer,
    handleTemplateChange,
    openAnnotation,
    closeAnnotation,
    saveAnnotation,
    refreshCurrentImage
  };
}
