import { createOpenAI } from '@ai-sdk/openai';
import BaseClient from './base.js';

class OpenAIClient extends BaseClient {
  constructor(config) {
    super(config);
    this.openai = createOpenAI({
      baseURL: this.endpoint,
      apiKey: this.apiKey
    });
  }

  _getModel() {
    return this.openai(this.model);
  }
}

module.exports = OpenAIClient;
