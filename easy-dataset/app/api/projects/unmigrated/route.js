import { getProjectRoot } from '@/lib/db/base';
import { db } from '@/lib/db/index';
import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

/**
 * Get list of unmigrated projects
 * @returns {Promise<Response>} Response containing unmigrated project IDs
 */
export async function GET(request) {
  // Read query params from request URL
  const { searchParams } = new URL(request.url);
  // Force a unique value per request
  const timestamp = searchParams.get('_t') || Date.now();
  try {
    // Get project root directory
    const projectRoot = await getProjectRoot();

    // Read all folders under project root (each folder represents a project)
    const files = await fs.promises.readdir(projectRoot, { withFileTypes: true });

    // Filter directories
    const projectDirs = files.filter(file => file.isDirectory());

    // Return empty list if no project directories exist
    if (projectDirs.length === 0) {
      return NextResponse.json({
        success: true,
        data: []
      });
    }

    // Collect all project IDs
    const projectIds = projectDirs.map(dir => dir.name);

    // Batch query migrated projects
    const existingProjects = await db.projects.findMany({
      where: {
        id: {
          in: projectIds
        }
      },
      select: {
        id: true
      }
    });

    // Convert to Set for fast lookups
    const existingProjectIds = new Set(existingProjects.map(p => p.id));

    // Filter unmigrated projects
    const unmigratedProjectDirs = projectDirs.filter(dir => !existingProjectIds.has(dir.name));

    // Build unmigrated project ID list
    const unmigratedProjects = unmigratedProjectDirs.map(dir => dir.name);

    return NextResponse.json({
      success: true,
      data: unmigratedProjects,
      projectRoot,
      number: Date.now(),
      timestamp
    });
  } catch (error) {
    console.error('Failed to get unmigrated project list:', String(error));
    return NextResponse.json(
      {
        success: false,
        error: error.message
      },
      { status: 500 }
    );
  }
}
