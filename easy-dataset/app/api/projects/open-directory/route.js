import { getProjectRoot } from '@/lib/db/base';
import { NextResponse } from 'next/server';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Open project directory
 * @returns {Promise<Response>} Operation result response
 */
export async function POST(request) {
  try {
    const { projectId } = await request.json();

    if (!projectId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Project ID is required'
        },
        { status: 400 }
      );
    }

    // Get project root directory
    const projectRoot = await getProjectRoot();
    const projectPath = path.join(projectRoot, projectId);

    // Open directory based on OS
    const platform = process.platform;
    let command;

    if (platform === 'win32') {
      // Windows
      command = `explorer "${projectPath}"`;
    } else if (platform === 'darwin') {
      // macOS
      command = `open "${projectPath}"`;
    } else {
      // Linux and others
      command = `xdg-open "${projectPath}"`;
    }

    await execAsync(command);

    return NextResponse.json({
      success: true,
      message: 'Project directory opened'
    });
  } catch (error) {
    console.error('Failed to open project directory:', String(error));
    return NextResponse.json(
      {
        success: false,
        error: error.message
      },
      { status: 500 }
    );
  }
}
