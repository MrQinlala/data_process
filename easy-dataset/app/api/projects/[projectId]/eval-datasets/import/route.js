import { NextResponse } from 'next/server';
import { db } from '@/lib/db/index';
import { nanoid } from 'nanoid';
import * as XLSX from 'xlsx';

/**
 * Validate true/false item schema
 */
function validateTrueFalse(item, index) {
  const errors = [];
  if (!item.question || typeof item.question !== 'string') {
    errors.push(`Item ${index + 1}: missing or invalid "question"`);
  }
  if (!item.correctAnswer || (item.correctAnswer !== '✅' && item.correctAnswer !== '❌')) {
    errors.push(`Item ${index + 1}: "correctAnswer" must be "✅" or "❌"`);
  }
  return errors;
}

/**
 * Validate single-choice item schema
 */
function validateSingleChoice(item, index) {
  const errors = [];
  if (!item.question || typeof item.question !== 'string') {
    errors.push(`Item ${index + 1}: missing or invalid "question"`);
  }

  // Normalize options
  let options = item.options;
  if (typeof options === 'string') {
    try {
      options = JSON.parse(options);
    } catch (e) {
      errors.push(`Item ${index + 1}: invalid "options" format; unable to parse`);
      return errors;
    }
  }

  if (!options || !Array.isArray(options) || options.length < 2) {
    errors.push(`Item ${index + 1}: "options" must be an array with at least 2 items`);
  }
  if (!item.correctAnswer || !/^[A-Z]$/.test(item.correctAnswer)) {
    errors.push(`Item ${index + 1}: "correctAnswer" must be a single uppercase letter (A-Z)`);
  }
  return errors;
}

/**
 * Validate multiple-choice item schema
 */
function validateMultipleChoice(item, index) {
  const errors = [];
  if (!item.question || typeof item.question !== 'string') {
    errors.push(`Item ${index + 1}: missing or invalid "question"`);
  }

  // Normalize options
  let options = item.options;
  if (typeof options === 'string') {
    try {
      options = JSON.parse(options);
    } catch (e) {
      errors.push(`Item ${index + 1}: invalid "options" format; unable to parse`);
      return errors;
    }
  }

  if (!options || !Array.isArray(options) || options.length < 2) {
    errors.push(`Item ${index + 1}: "options" must be an array with at least 2 items`);
  }

  // Normalize correctAnswer
  let correctAnswer = item.correctAnswer;
  if (typeof correctAnswer === 'string') {
    try {
      correctAnswer = JSON.parse(correctAnswer);
    } catch (e) {
      errors.push(`Item ${index + 1}: invalid "correctAnswer" format; unable to parse`);
      return errors;
    }
  }

  if (!correctAnswer || !Array.isArray(correctAnswer) || correctAnswer.length < 1) {
    errors.push(`Item ${index + 1}: "correctAnswer" must be an array with at least 1 item`);
  }
  // Validate each answer token
  if (Array.isArray(correctAnswer)) {
    for (const ans of correctAnswer) {
      if (!/^[A-Z]$/.test(ans)) {
        errors.push(`Item ${index + 1}: "${ans}" is not a valid option letter in "correctAnswer"`);
      }
    }
  }
  return errors;
}

/**
 * Validate QA item schema (short_answer and open_ended)
 */
function validateQA(item, index) {
  const errors = [];
  if (!item.question || typeof item.question !== 'string') {
    errors.push(`Item ${index + 1}: missing or invalid "question"`);
  }
  if (!item.correctAnswer || typeof item.correctAnswer !== 'string') {
    errors.push(`Item ${index + 1}: missing or invalid "correctAnswer"`);
  }
  return errors;
}

/**
 * Validate data by question type
 */
function validateData(data, questionType) {
  const allErrors = [];

  for (let i = 0; i < data.length; i++) {
    let errors = [];
    switch (questionType) {
      case 'true_false':
        errors = validateTrueFalse(data[i], i);
        break;
      case 'single_choice':
        errors = validateSingleChoice(data[i], i);
        break;
      case 'multiple_choice':
        errors = validateMultipleChoice(data[i], i);
        break;
      case 'short_answer':
      case 'open_ended':
        errors = validateQA(data[i], i);
        break;
      default:
        errors = [`Unsupported question type: ${questionType}`];
    }
    allErrors.push(...errors);
  }

  return allErrors;
}

/**
 * Parse an Excel file
 */
function parseExcel(buffer, questionType) {
  const excelHeaders = {
    question: '\u9898\u76ee',
    correctAnswer: '\u6b63\u786e\u7b54\u6848',
    answer: '\u7b54\u6848',
    options: '\u9009\u9879'
  };

  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rawData = XLSX.utils.sheet_to_json(sheet, { defval: '' });

  // Convert to normalized schema
  const data = rawData.map(row => {
    const item = {
      question: row.question || row[excelHeaders.question] || '',
      correctAnswer: row.correctAnswer || row[excelHeaders.correctAnswer] || row[excelHeaders.answer] || ''
    };

    // Handle options (choice questions)
    if (questionType === 'single_choice' || questionType === 'multiple_choice') {
      // Try to parse from options column
      if (row.options || row[excelHeaders.options]) {
        let optionsStr = (row.options || row[excelHeaders.options]).trim();

        // Replace single quotes so it becomes valid JSON
        if (optionsStr.startsWith('[') && optionsStr.includes("'")) {
          optionsStr = optionsStr.replace(/'/g, '"');
        }

        try {
          // Try JSON parsing
          item.options = JSON.parse(optionsStr);
        } catch {
          // Fallback: split by separators
          item.options = optionsStr
            .split(/[,;|，；]/)
            .map(o => o.trim())
            .filter(Boolean);
        }
      }
    }

    // Handle multiple-choice correctAnswer
    if (questionType === 'multiple_choice') {
      if (typeof item.correctAnswer === 'string') {
        let answerStr = item.correctAnswer.trim();

        // Replace single quotes so it becomes valid JSON
        if (answerStr.startsWith('[') && answerStr.includes("'")) {
          answerStr = answerStr.replace(/'/g, '"');
        }

        // Try JSON parsing
        try {
          item.correctAnswer = JSON.parse(answerStr);
        } catch {
          // Split string such as "A,B,C" or "ABC"
          if (answerStr.includes(',') || answerStr.includes('，')) {
            item.correctAnswer = answerStr.split(/[,，]/).map(a => a.trim().toUpperCase());
          } else {
            // Split characters such as "ABC" -> ["A", "B", "C"]
            item.correctAnswer = answerStr
              .toUpperCase()
              .split('')
              .filter(c => /[A-Z]/.test(c));
          }
        }
      }
    }

    return item;
  });

  return data;
}

/**
 * Parse a JSON file
 */
function parseJSON(content) {
  return JSON.parse(content);
}

/**
 * POST - Import evaluation datasets
 */
export async function POST(request, { params }) {
  try {
    const { projectId } = params;
    const formData = await request.formData();

    const file = formData.get('file');
    const questionType = formData.get('questionType');
    const tags = formData.get('tags') || '';

    console.log(`[Import] Start processing. Project: ${projectId}, questionType: ${questionType}, tags: ${tags}`);

    if (!file) {
      return NextResponse.json({ code: 400, error: 'Please upload a file' }, { status: 400 });
    }

    if (!questionType) {
      return NextResponse.json({ code: 400, error: 'Please select a question type' }, { status: 400 });
    }

    // Validate question type
    const validTypes = ['true_false', 'single_choice', 'multiple_choice', 'short_answer', 'open_ended'];
    if (!validTypes.includes(questionType)) {
      return NextResponse.json({ code: 400, error: `Unsupported question type: ${questionType}` }, { status: 400 });
    }

    // Get file extension
    const fileName = file.name;
    const fileExt = fileName.split('.').pop().toLowerCase();
    console.log(`[Import] File name: ${fileName}, extension: ${fileExt}`);

    // Validate file type
    if (!['json', 'xls', 'xlsx'].includes(fileExt)) {
      return NextResponse.json(
        { code: 400, error: 'Unsupported file format. Please upload a json, xls, or xlsx file' },
        { status: 400 }
      );
    }

    // Read file content
    const buffer = await file.arrayBuffer();
    let data = [];

    // Parse file
    console.log('[Import] Parsing file...');
    if (fileExt === 'json') {
      const content = new TextDecoder().decode(buffer);
      data = parseJSON(content);
    } else {
      data = parseExcel(Buffer.from(buffer), questionType);
    }

    console.log(`[Import] Parsing completed. Total items: ${data.length}`);

    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json({ code: 400, error: 'File is empty or has an invalid format' }, { status: 400 });
    }

    // Validate data
    console.log('[Import] Validating data...');
    const errors = validateData(data, questionType);
    if (errors.length > 0) {
      console.log(`[Import] Validation failed. Error count: ${errors.length}`);
      return NextResponse.json(
        {
          code: 400,
          error: 'Data validation failed',
          details: errors.slice(0, 10),
          totalErrors: errors.length
        },
        { status: 400 }
      );
    }

    console.log('[Import] Validation passed. Writing to database...');

    // Prepare data
    const now = new Date();
    const evalDatasets = data.map(item => {
      // Normalize options
      let options = item.options;
      if (typeof options === 'string') {
        try {
          options = JSON.parse(options);
        } catch (e) {
          // Keep original on parse failure
        }
      }

      // Normalize correctAnswer
      let correctAnswer = item.correctAnswer;
      if (typeof correctAnswer === 'string' && questionType === 'multiple_choice') {
        try {
          correctAnswer = JSON.parse(correctAnswer);
        } catch (e) {
          // Keep original on parse failure
        }
      }

      return {
        id: nanoid(),
        projectId,
        question: item.question,
        questionType,
        options: options ? JSON.stringify(options) : '',
        // For multiple_choice, store correctAnswer as JSON array string
        correctAnswer: Array.isArray(correctAnswer) ? JSON.stringify(correctAnswer) : correctAnswer,
        tags: tags || '',
        note: '',
        createAt: now,
        updateAt: now
      };
    });

    // Batch insert
    const batchSize = 100;
    let insertedCount = 0;

    for (let i = 0; i < evalDatasets.length; i += batchSize) {
      const batch = evalDatasets.slice(i, i + batchSize);
      await db.evalDatasets.createMany({ data: batch });
      insertedCount += batch.length;
      console.log(`[Import] Inserted ${insertedCount}/${evalDatasets.length} items`);
    }

    console.log(`[Import] Import completed. Total inserted: ${insertedCount}`);

    return NextResponse.json({
      code: 0,
      data: {
        total: insertedCount,
        questionType,
        tags
      },
      message: `Successfully imported ${insertedCount} evaluation items`
    });
  } catch (error) {
    console.error('[Import] Import failed:', error);
    return NextResponse.json(
      {
        code: 500,
        error: 'Import failed',
        message: error.message
      },
      { status: 500 }
    );
  }
}
