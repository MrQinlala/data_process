import { jsonrepair } from 'jsonrepair';

export function extractJsonFromLLMOutput(output) {
  // console.log('LLM 输出:', output);
  if (output.trim().startsWith('<think')) {
    output = extractAnswer(output);
  }
  try {
    const json = JSON.parse(output);
    return json;
  } catch {}
  const jsonStart = output.indexOf('```json');
  const jsonEnd = output.lastIndexOf('```');
  if (jsonStart !== -1 && jsonEnd !== -1) {
    const regex = /```json\s*([\s\S]*?)```/;
    const match = regex.exec(output);

    const jsonString = match[1].trim();
    try {
      const json = JSON.parse(jsonString);
      return json;
    } catch (error) {
      try {
        const json = JSON.parse(jsonrepair(output));
        return json;
      } catch (error) {
        console.error('解析 JSON 时出错:', { error, llmResponse: output });
      }
    }
  } else {
    try {
      const json = JSON.parse(jsonrepair(output));
      return json;
    } catch (error) {
      console.log(error);
      console.error('模型未按标准格式输出:', output);
      return undefined;
    }
  }
}

export function safeParseJSON(output) {
  // console.log('LLM 输出:', output);
  if (output.trim().startsWith('<think')) {
    output = extractAnswer(output);
  }
  try {
    const json = JSON.parse(output);
    return json;
  } catch {}
  const jsonStart = output.indexOf('```json');
  const jsonEnd = output.lastIndexOf('```');
  if (jsonStart !== -1 && jsonEnd !== -1) {
    const regex = /```json\s*([\s\S]*?)```/;
    const match = regex.exec(output);

    const jsonString = match[1].trim();
    try {
      const json = JSON.parse(jsonString);
      return json;
    } catch (error) {
      try {
        const json = JSON.parse(jsonrepair(output));
        return json;
      } catch (error) {
        return output;
      }
    }
  } else {
    try {
      const json = JSON.parse(jsonrepair(output));
      return json;
    } catch (error) {
      return output;
    }
  }
}

export function extractThinkChain(text) {
  const startTags = ['<think>', '<thinking>'];
  const endTags = ['</think>', '</thinking>'];
  let startIndex = -1;
  let endIndex = -1;
  let usedStartTag = '';
  let usedEndTag = '';

  for (let i = 0; i < startTags.length; i++) {
    const currentStartIndex = text.indexOf(startTags[i]);
    if (currentStartIndex !== -1) {
      startIndex = currentStartIndex;
      usedStartTag = startTags[i];
      usedEndTag = endTags[i];
      break;
    }
  }

  if (startIndex === -1) {
    return '';
  }

  endIndex = text.indexOf(usedEndTag, startIndex + usedStartTag.length);

  if (endIndex === -1) {
    return '';
  }

  return text.slice(startIndex + usedStartTag.length, endIndex).trim();
}

export function extractAnswer(text) {
  const startTags = ['<think>', '<thinking>'];
  const endTags = ['</think>', '</thinking>'];
  for (let i = 0; i < startTags.length; i++) {
    const start = startTags[i];
    const end = endTags[i];
    if (text.includes(start) && text.includes(end)) {
      const partsBefore = text.split(start);
      const partsAfter = partsBefore[1].split(end);
      return (partsBefore[0].trim() + ' ' + partsAfter[1].trim()).trim();
    }
  }
  return text;
}

export function removeLeadingNumber(label) {
  const numberPrefixRegex = /^\d+(?:\.\d+)*\s+/;
  return label.replace(numberPrefixRegex, '');
}
