import { NextResponse } from 'next/server';
import axios from 'axios';

// Fetch model list from provider
export async function POST(request) {
  try {
    const { endpoint, providerId, apiKey } = await request.json();

    if (!endpoint) {
      return NextResponse.json({ error: 'Missing required parameter: endpoint' }, { status: 400 });
    }

    let url = endpoint.replace(/\/$/, ''); // Remove trailing slash

    // Handle Ollama endpoint
    if (providerId === 'ollama') {
      // Remove possible /v1 or other version suffix
      url = url.replace(/\/v\d+$/, '');

      // Append /api if missing
      if (!url.includes('/api')) {
        url += '/api';
      }
      url += '/tags';
    } else {
      url += '/models';
    }

    const headers = {};
    if (apiKey) {
      headers.Authorization = `Bearer ${apiKey}`;
    }

    const response = await axios.get(url, { headers });

    // Format response per provider
    let formattedModels = [];
    if (providerId === 'ollama') {
      // Ollama /api/tags format: { models: [{ name: 'model-name', ... }] }
      if (response.data.models && Array.isArray(response.data.models)) {
        formattedModels = response.data.models.map(item => ({
          modelId: item.name,
          modelName: item.name,
          providerId
        }));
      }
    } else {
      // Default handling (OpenAI-compatible)
      if (response.data.data && Array.isArray(response.data.data)) {
        formattedModels = response.data.data.map(item => ({
          modelId: item.id,
          modelName: item.id,
          providerId
        }));
      }
    }

    return NextResponse.json(formattedModels);
  } catch (error) {
    console.error('Failed to fetch model list:', String(error));

    // Handle known error shapes
    if (error.response) {
      if (error.response.status === 401) {
        return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
      }
      return NextResponse.json(
        { error: `Failed to fetch model list: ${error.response.statusText}` },
        { status: error.response.status }
      );
    }

    return NextResponse.json({ error: `Failed to fetch model list: ${error.message}` }, { status: 500 });
  }
}
