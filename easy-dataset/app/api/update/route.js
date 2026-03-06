import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';

export async function POST() {
  try {
    const desktopDir = path.join(process.cwd(), 'desktop');
    const updaterPath = path.join(desktopDir, 'scripts', 'updater.js');

    if (!fs.existsSync(updaterPath)) {
      return NextResponse.json(
        {
          success: false,
          message: 'The update feature is only available in the client environment'
        },
        { status: 400 }
      );
    }

    // Run update script
    return new Promise(resolve => {
      const updaterProcess = exec(`node "${updaterPath}"`, { cwd: process.cwd() });

      let output = '';

      updaterProcess.stdout.on('data', data => {
        output += data.toString();
        console.log(`Update output: ${data}`);
      });

      updaterProcess.stderr.on('data', data => {
        output += data.toString();
        console.error(`Update error: ${data}`);
      });

      updaterProcess.on('close', code => {
        console.log(`Update process exit, exit code: ${code}`);

        if (code === 0) {
          resolve(
            NextResponse.json({
              success: true,
              message: 'Update successful, application will restart'
            })
          );
        } else {
          resolve(
            NextResponse.json(
              {
                success: false,
                message: `Update failed, exit code: ${code}, output: ${output}`
              },
              { status: 500 }
            )
          );
        }
      });
    });
  } catch (error) {
    console.error('Failed to execute update:', String(error));
    return NextResponse.json(
      {
        success: false,
        message: `Failed to execute update: ${error.message}`
      },
      { status: 500 }
    );
  }
}
