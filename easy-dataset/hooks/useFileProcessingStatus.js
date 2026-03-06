import { useState, useEffect } from 'react';

// 存储文件处理状态的共享对象
const fileProcessingSubscribers = {
  value: false,
  listeners: new Set()
};

// 存储文件任务信息的共享对象
const fileTaskSubscribers = {
  value: null,
  listeners: new Set()
};

/**
 * 自定义hook，用于在组件间共享文件处理任务的状态
 */
export default function useFileProcessingStatus() {
  const [taskFileProcessing, setTaskFileProcessing] = useState(fileProcessingSubscribers.value);
  const [task, setTask] = useState(fileTaskSubscribers.value);

  useEffect(() => {
    // 添加当前组件为订阅者
    const updateProcessingState = newValue => setTaskFileProcessing(newValue);
    const updateTaskState = newTask => setTask(newTask);

    fileProcessingSubscribers.listeners.add(updateProcessingState);
    fileTaskSubscribers.listeners.add(updateTaskState);

    // 组件卸载时清理
    return () => {
      fileProcessingSubscribers.listeners.delete(updateProcessingState);
      fileTaskSubscribers.listeners.delete(updateTaskState);
    };
  }, []);

  // 共享的setState函数
  const setSharedFileProcessing = newValue => {
    fileProcessingSubscribers.value = newValue;
    // 通知所有订阅者
    fileProcessingSubscribers.listeners.forEach(listener => listener(newValue));
  };

  // 共享的setTask函数
  const setSharedTask = newTask => {
    fileTaskSubscribers.value = newTask;
    // 通知所有订阅者
    fileTaskSubscribers.listeners.forEach(listener => listener(newTask));
  };

  return {
    taskFileProcessing,
    task,
    setTaskFileProcessing: setSharedFileProcessing,
    setTask: setSharedTask
  };
}
