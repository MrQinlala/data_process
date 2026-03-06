/**
 * 多轮对话数据集导出API
 * 直接导出原始的 ShareGPT 格式数据集
 */

import { NextResponse } from 'next/server';
import { getAllDatasetConversations } from '@/lib/db/dataset-conversations';

/**
 * 导出多轮对话数据集
 */
export async function GET(request, { params }) {
  try {
    const { projectId } = params;
    const { searchParams } = new URL(request.url);

    // 筛选条件
    const filters = {
      confirmed: searchParams.get('confirmed')
    };

    // 清除空值
    Object.keys(filters).forEach(key => {
      if (!filters[key]) delete filters[key];
    });

    // 获取所有对话数据集
    const conversations = await getAllDatasetConversations(projectId, filters);

    if (conversations.length === 0) {
      return NextResponse.json([]);
    }

    // 转换为 ShareGPT 格式数组
    const shareGptData = [];

    for (const conversation of conversations) {
      try {
        // 解析 rawMessages
        const messages = JSON.parse(conversation.rawMessages || '[]');

        if (messages.length > 0) {
          // 构建 ShareGPT 格式对象
          const shareGptItem = {
            messages: messages
          };

          shareGptData.push(shareGptItem);
        }
      } catch (error) {
        console.error(`解析对话消息失败 ${conversation.id}:`, error);
        // 跳过解析失败的对话，继续处理其他对话
        continue;
      }
    }

    return NextResponse.json(shareGptData);
  } catch (error) {
    console.error('导出多轮对话数据集失败:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message
      },
      { status: 500 }
    );
  }
}
