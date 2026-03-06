const axios = require('axios');

/**
 * 结构化知识抽取脚本（图树融合 Schema）
 *
 * 功能：
 *   无论输入是纯文本、ShareGPT 格式、instruction/input/output 还是对话记录，
 *   均提示大模型先"提纯"内容，再按照图树融合的 JSON Schema 输出结构化结果：
 *     - document_meta：文档级元数据
 *     - nodes：业务逻辑节点（规则、概念、事件、观点……）
 *     - edges：节点之间的业务依赖 / 跳跃关系
 *
 * 使用前请修改下面的 OPENAI_BASE_URL / OPENAI_API_KEY / MODEL。
 */

// ===== 1. 模型调用配置 =====
const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
const OPENAI_API_KEY  = process.env.OPENAI_API_KEY  || 'YOUR_API_KEY';
const MODEL           = process.env.OPENAI_MODEL     || 'gpt-4o-mini';

// ===== 2. 测试样本 =====
// 支持三种格式：
//   A. instruction/input/output（Alpaca 格式）
//   B. conversations 数组（ShareGPT 格式）
//   C. text 纯文本
// 脚本会在 normalizeInput() 中自动识别并拼合为一段"原始文本"交给大模型。
const rawSamples = [
  // ---- 样本 A：Alpaca 格式 ----
  {
    id: 'sample_alpaca',
    instruction:
      '作为一名金融领域专家，回答下面的问题。你可以参考下面的材料。\n（注意：1、问题可能与材料无关，请直接忽略无关材料。 2、尽量不要直接复制材料内容作为答案，而应该将材料内容作为事件的补充与潜在分析，启发思考）3、请直接给出分析和答案，无需给出具体参考了哪篇文档）；\n参考材料 1:\n《6月1日国内四大证券报纸、重要财经媒体头版头条内容精华摘要》\n深入学习贯彻习近平经济思想 坚定不移推动高质量发展  习近平总书记强调，要坚持发展是党执政兴国的第一要务，发展必须是高质量发展。在强国建设、民族复兴的新征程上，我们必须深刻领会高质量发展的内涵要求和重大意义，坚定不移推动高质量发展。  此轮人民币汇率破"7"的经济逻辑  5月31日，离岸人民币兑美元一度跌破7.11关口。在一系列因素影响下，人民币近期或弱势运行，但预计贬值将弱于去年，长期汇率仍将处于双向波动的合理区间内。  上市券商ESG报告全扫描：定量披露仍待加强\n\n参考材料 2:\n《人工智能时代弄潮儿：微软资助AMD向AI芯片领域进军》\n不过知情人士称，微软的举动并不预示着与英伟达分道扬镳。微软打算继续与该公司密切合作，英伟达的芯片是训练和运行人工智能系统的主力。微软还在设法获得更多英伟达的处理器，这凸显了微软和其他公司面临的零部件短缺问题。  此外，人工智能也是AMD发展的主要方向。AMD首席执行官苏姿丰近日表示，我们对人工智能领域的机会感到非常兴奋，AMD已经将人工智能列为第一战略重点，人工智能创造了一个比云更广阔的市场。  苏姿丰表示，AMD将有机会为其客户生产部分定制芯片，用于他们的人工智能数据中心。（文章来源：财联社）\n\n参考材料 3:\n【微软否认与AMD合作开发自研处理器Athena】    此前有知情人士向媒体透露，微软正在和AMD合作，共同开发代号为"Athena"的自研AI处理器。不过，微软发言人Frank Shaw近日辟谣，否认AMD参与Athena研发计划。Frank Shaw称AMD是一个很好的合作伙伴，然而，他们与Athena无关。\n  点评：目前，Azure团队负责微软内部云端硬件和基础设施的开发建设，该团队已拥有将近1000名员工。Azure 团队很重视Athena项目，他们正在开发可应用于训练和运行AI模型的GPU。微软已提供一小部分芯片原型给内部和OpenAI使用，以测试其在GPT-4 等最新大语言模型的表现。 ',
    input: '',
    output:
      '根据提供的材料，我们可以看到微软发言人否认微软与AMD合作开发自研处理器"Athena"的消息。然而，这并不排除微软与AMD之间仍存在其他形式的合作关系。\n\n首先，第一份参考材料中提到微软正密切合作并购买英伟达的处理器，以解决零部件短缺问题，这暗示了微软与英伟达的合作依然持续。而英伟达的芯片是训练和运行人工智能系统的主力，这与AMD在人工智能领域的发展方向不冲突。\n\n其次，第二份参考材料中提到AMD将人工智能列为第一战略重点，并表示AMD有机会为客户生产部分定制芯片用于人工智能数据中心。虽然并没有明确提到与微软的合作关系，但这表明AMD在人工智能领域具备潜在合作机会。\n\n综上所述，尽管微软发言人否认了微软与AMD合作开发自研处理器"Athena"的消息，但其他证据表明微软与AMD之间仍可能存在其他形式的合作关系，尤其是在人工智能领域。',
    history: []
  },

  // ---- 样本 B：ShareGPT 格式 ----
  {
    id: 'sample_sharegpt',
    conversations: [
      { from: 'human', value: '企业在什么条件下可以享受税收减免？' },
      { from: 'gpt', value: '根据相关规定，企业在符合环保标准的情况下，可享受税收减免。但若企业在过去三年内有环境违规记录，则不适用该减免条款。环保标准是指国家发改委最新颁布的《绿色企业认证标准》。' }
    ]
  },

  // ---- 样本 C：纯文本 ----
  {
    id: 'sample_plain',
    text: '5月31日，离岸人民币兑美元一度跌破7.11关口。在一系列因素影响下，人民币近期或弱势运行，但预计贬值将弱于去年，长期汇率仍将处于双向波动的合理区间内。此外，上市券商ESG报告全扫描显示定量披露仍待加强。'
  }
];

// ===== 3. 输入归一化：把三种格式统一变成一段纯文本 =====
function normalizeInput(sample) {
  // A. Alpaca 格式
  if (sample.instruction || sample.output) {
    var parts = [];
    if (sample.instruction) parts.push(sample.instruction);
    if (sample.input)       parts.push(sample.input);
    if (sample.output)      parts.push(sample.output);
    return parts.join('\n\n');
  }

  // B. ShareGPT 格式
  if (Array.isArray(sample.conversations)) {
    return sample.conversations
      .map(function (turn) { return (turn.from || turn.role || 'unknown') + ': ' + (turn.value || turn.content || ''); })
      .join('\n');
  }

  // C. 纯文本
  if (sample.text) {
    return sample.text;
  }

  // 兜底
  return JSON.stringify(sample);
}

// ===== 4. 优化后的 Prompt 构造：图树融合 Schema =====
function buildPrompt(sample) {
  var rawText = normalizeInput(sample);

  return (
'请扮演结构化知识抽取专家。你的任务是阅读输入文本，识别其中的客观业务逻辑节点，并提取它们之间的结构化关系。\n' +
'请严格按照以下"图树融合"的 JSON Schema 输出，不要输出任何多余文字、markdown 标记或解释。\n\n' +

'【输出 JSON Schema】\n' +
'{\n' +
'  "document_meta": {\n' +
'    "domain": "string     // 文本所属主领域，如 finance / legal / tech 等",\n' +
'    "summary": "string    // 一句话概括核心业务逻辑或事件"\n' +
'  },\n' +
'  "nodes": [\n' +
'    {\n' +
'      "node_id": "string          // 唯一标识，如 node_1",\n' +
'      "node_type": "string        // 取值范围：rule | exception | concept | event | opinion | data_point | conclusion",\n' +
'      "hierarchy_path": ["string"] // 知识树中的层级路径，如 ["人工智能", "芯片战略", "定制化计划"]",\n' +
'      "content": "string          // 对该节点业务逻辑的精炼概括",\n' +
'      "source_quote": "string     // 【重要】从原文中精确摘录的一句话，用以证明 content 的准确性，防止幻觉",\n' +
'      "entities": ["string"]      // 核心实体\n' +
'    }\n' +
'  ],\n' +
'  "edges": [\n' +
'    {\n' +
'      "source_node": "string       // 起始 node_id",\n' +
'      "target_node": "string       // 目标 node_id",\n' +
'      "relation_type": "string     // 取值范围：depends_on | exception_to | causes | supports | contradicts | temporal_sequence | exemplifies",\n' +
'      "description": "string       // 一句话解释为何存在该关系"\n' +
'    }\n' +
'  ]\n' +
'}\n\n' +

'【关键抽取规则】\n' +
'1. 溯源强制性：每一个 node 的 source_quote 必须是输入文本中真实存在的原话片段。\n' +
'2. 关系显式化：仔细寻找文本中隐藏的逻辑词（如"但是"、"前提是"、"导致"），并在 edges 中用对应的 relation_type 体现。\n' +
'3. 剔除噪音：忽略所有无关的问候语、对话提示符（如"human:"、"gpt:"）或与业务逻辑无关的闲聊。\n\n' +

'【待抽取的原始文本】\n' +
rawText
  );
}

// ===== 5. 调用兼容 OpenAI 的聊天接口 =====
function callLlm(prompt) {
  if (!OPENAI_API_KEY || OPENAI_API_KEY === 'YOUR_API_KEY') {
    throw new Error(
      '请先在环境变量 OPENAI_API_KEY 中配置你的 API Key，或直接修改脚本中的 OPENAI_API_KEY 常量。'
    );
  }

  return axios.post(
    OPENAI_BASE_URL + '/chat/completions',
    {
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: '你是精准的结构化知识抽取专家。无论输入的格式如何（纯文本、对话记录、问答对），你都能从中提取客观的业务逻辑节点及其关系，并严格按照用户给定的 JSON Schema 输出。只输出 JSON，不输出任何多余内容。'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.1
    },
    {
      headers: {
        Authorization: 'Bearer ' + OPENAI_API_KEY,
        'Content-Type': 'application/json'
      },
      timeout: 600000
    }
  ).then(function (resp) {
    if (
      !resp.data ||
      !resp.data.choices ||
      !resp.data.choices[0] ||
      !resp.data.choices[0].message ||
      !resp.data.choices[0].message.content
    ) {
      throw new Error('LLM 返回结构不符合 OpenAI /chat/completions 格式，请检查本地服务返回值。');
    }

    var content = String(resp.data.choices[0].message.content || '').trim();

    // 去掉代码块包裹
    var jsonText = content.replace(/```json/gi, '').replace(/```/g, '').trim();

    // 兼容带有 <think> ... </think> 的思维链前缀，只截取第一个 { 到最后一个 } 之间的内容
    var firstBrace = jsonText.indexOf('{');
    var lastBrace = jsonText.lastIndexOf('}');
    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
      throw new Error('未在模型输出中找到有效的 JSON 对象，请检查提示词或模型输出。\n原始输出片段：' + content.substring(0, 300));
    }
    jsonText = jsonText.slice(firstBrace, lastBrace + 1);

    return JSON.parse(jsonText);
  });
}

// ===== 6. 主流程 =====
function main() {
  var dataset = [];
  var queue = Promise.resolve();

  rawSamples.forEach(function (sample) {
    queue = queue.then(function () {
      console.error('正在处理样本: ' + sample.id + ' ...');
      var prompt = buildPrompt(sample);
      return callLlm(prompt).then(function (graph) {
        dataset.push({
          id: sample.id,
          raw: sample,
          graph: graph   // 图树融合结构
        });
      });
    });
  });

  return queue.then(function () {
    console.log(JSON.stringify(dataset, null, 2));
  });
}

main().catch(function (err) {
  console.error('运行出错：', err.message || err);
  process.exit(1);
});
