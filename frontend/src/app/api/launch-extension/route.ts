import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import path from 'path'
import os from 'os'

export async function POST(request: NextRequest) {
  try {
    // Get the project root directory dynamically
    // Frontend runs from frontend folder, so go up one level
    const projectRoot = path.resolve(process.cwd(), '..')
    const extensionPath = path.join(projectRoot, 'extension')
    
    // Detect OS and use appropriate command
    const isWindows = os.platform() === 'win32'
    const pythonCmd = isWindows ? 'python' : 'python3'
    
    let command
    if (isWindows) {
      command = `cd /d "${extensionPath}" && ${pythonCmd} floating_translator.py`
    } else {
      command = `cd "${extensionPath}" && ${pythonCmd} floating_translator.py`
    }
    
    console.log('Extension path:', extensionPath)
    console.log('Command:', command)
    
    // Execute the command in the background
    exec(command, { cwd: extensionPath }, (error, stdout, stderr) => {
      if (error) {
        console.error('Extension launch error:', error)
        console.error('stderr:', stderr)
      } else {
        console.log('Extension launched successfully')
        console.log('stdout:', stdout)
      }
    })
    
    return NextResponse.json({ success: true, message: 'Extension launched' })
  } catch (error) {
    console.error('Failed to launch extension:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to launch extension' },
      { status: 500 }
    )
  }
}