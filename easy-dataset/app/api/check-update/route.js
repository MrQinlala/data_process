import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

// Get current version
function getCurrentVersion() {
  try {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    return packageJson.version;
  } catch (error) {
    console.error('Failed to read version from package.json:', String(error));
    return '1.0.0';
  }
}

// Get latest version from GitHub
async function getLatestVersion() {
  try {
    const owner = 'ConardLi';
    const repo = 'easy-dataset';
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases/latest`);

    if (!response.ok) {
      throw new Error(`GitHub API request failed: ${response.status}`);
    }

    const data = await response.json();
    return data.tag_name.replace('v', '');
  } catch (error) {
    console.error('Failed to fetch latest version:', String(error));
    return null;
  }
}

// Check for updates
export async function GET() {
  try {
    const currentVersion = getCurrentVersion();
    const latestVersion = await getLatestVersion();

    if (!latestVersion) {
      return NextResponse.json({
        hasUpdate: false,
        currentVersion,
        latestVersion: null,
        error: 'Failed to fetch latest version'
      });
    }

    // Simple semver-like comparison
    const hasUpdate = compareVersions(latestVersion, currentVersion) > 0;

    return NextResponse.json({
      hasUpdate,
      currentVersion,
      latestVersion,
      releaseUrl: hasUpdate ? `https://github.com/ConardLi/easy-dataset/releases/tag/v${latestVersion}` : null
    });
  } catch (error) {
    console.error('Failed to check for updates:', String(error));
    return NextResponse.json(
      {
        hasUpdate: false,
        error: 'Failed to check for updates'
      },
      { status: 500 }
    );
  }
}

// Simple version comparison
function compareVersions(a, b) {
  const partsA = a.split('.').map(Number);
  const partsB = b.split('.').map(Number);

  for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
    const numA = i < partsA.length ? partsA[i] : 0;
    const numB = i < partsB.length ? partsB[i] : 0;

    if (numA > numB) return 1;
    if (numA < numB) return -1;
  }

  return 0;
}
