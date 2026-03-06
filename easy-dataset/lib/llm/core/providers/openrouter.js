import { createOpenRouter } from '@openrouter/ai-sdk-provider';

import BaseClient from './base.js';

class OpenRouterClient extends BaseClient {
  constructor(config) {
    super(config);
    this.openrouter = createOpenRouter({
      baseURL: this.endpoint,
      apiKey: this.apiKey
    });
  }

  _getModel() {
    return this.openrouter(this.model);
  }
}

module.exports = OpenRouterClient;
