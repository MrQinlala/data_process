import { createZhipu } from 'zhipu-ai-provider';

import BaseClient from './base.js';

class ZhiPuClient extends BaseClient {
  constructor(config) {
    super(config);
    this.zhipu = createZhipu({
      baseURL: this.endpoint,
      apiKey: this.apiKey
    });
  }

  _getModel() {
    return this.zhipu(this.model);
  }
}

module.exports = ZhiPuClient;
