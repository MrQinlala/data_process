import { NextResponse } from 'next/server';
import { main } from '@/lib/db/fileToDb';

// Store migration task states
const migrationTasks = new Map();

/**
 * Start a migration task
 */
export async function POST() {
  try {
    // Generate a unique task ID
    const taskId = Date.now().toString();

    // Initialize task state
    migrationTasks.set(taskId, {
      status: 'running',
      progress: 0,
      total: 0,
      completed: 0,
      error: null,
      startTime: Date.now()
    });

    // Execute migration asynchronously
    executeMigration(taskId);

    // Return task ID
    return NextResponse.json({
      success: true,
      taskId
    });
  } catch (error) {
    console.error('Failed to start migration task:', String(error));
    return NextResponse.json(
      {
        success: false,
        error: error.message
      },
      { status: 500 }
    );
  }
}

/**
 * Get migration task status
 */
export async function GET(request) {
  try {
    // Get task ID from URL
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');

    if (!taskId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing taskId'
        },
        { status: 400 }
      );
    }

    // Read task state
    const task = migrationTasks.get(taskId);

    if (!task) {
      return NextResponse.json(
        {
          success: false,
          error: 'Task not found'
        },
        { status: 404 }
      );
    }

    // Return task state
    return NextResponse.json({
      success: true,
      task
    });
  } catch (error) {
    console.error('Failed to get migration task status:', String(error));
    return NextResponse.json(
      {
        success: false,
        error: error.message
      },
      { status: 500 }
    );
  }
}

/**
 * Execute migration task asynchronously
 * @param {string} taskId Task ID
 */
async function executeMigration(taskId) {
  try {
    // Read task state
    const task = migrationTasks.get(taskId);

    if (!task) {
      console.error(`Task not found: ${taskId}`);
      return;
    }

    // Reset task state to running
    task.status = 'running';
    task.progress = 0;
    task.completed = 0;
    task.total = 0;
    task.startTime = Date.now();

    // Persist task state once per second so clients can poll progress
    const statusUpdateInterval = setInterval(() => {
      // Only update while still running
      if (task.status === 'running') {
        migrationTasks.set(taskId, { ...task });
        console.log(
          `Migration task status updated: ${taskId}, progress: ${task.progress}%, completed: ${task.completed}/${task.total}`
        );
      } else {
        // Stop updating when task ends
        clearInterval(statusUpdateInterval);
      }
    }, 1000);

    // Run migration and let main(task) mutate progress fields
    const count = await main(task);

    // Clear status update timer
    clearInterval(statusUpdateInterval);

    // Mark as completed
    task.status = 'completed';
    task.progress = 100;
    task.completed = count;
    if (task.total === 0) task.total = count;
    task.endTime = Date.now();

    // Persist final task state
    migrationTasks.set(taskId, { ...task });

    // Clean up task state after 30 minutes
    setTimeout(
      () => {
        migrationTasks.delete(taskId);
        console.log(`Migration task state cleaned up: ${taskId}`);
      },
      30 * 60 * 1000
    );
  } catch (error) {
    console.error(`Failed to execute migration task: ${taskId}`, String(error));

    // Read task state
    const task = migrationTasks.get(taskId);

    if (task) {
      // Mark as failed
      task.status = 'failed';
      task.error = error.message;
      task.endTime = Date.now();

      // Persist task state
      migrationTasks.set(taskId, task);
    }
  }
}
