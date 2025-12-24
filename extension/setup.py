"""
Setup script for Floating Translator Extension
"""
import os
import sys
import subprocess
import platform

def install_requirements():
    """Install required packages"""
    requirements = ['requests', 'pyperclip', 'Pillow']
    
    for package in requirements:
        try:
            subprocess.check_call([sys.executable, '-m', 'pip', 'install', package])
            print(f"✓ Installed {package}")
        except subprocess.CalledProcessError:
            print(f"✗ Failed to install {package}")
            return False
    return True

def create_launcher():
    """Create platform-specific launcher"""
    system = platform.system()
    
    if system == "Windows":
        # Create batch file launcher
        batch_content = '''@echo off
cd /d "%~dp0"
python floating_translator.py
pause
'''
        with open('launch_extension.bat', 'w') as f:
            f.write(batch_content)
        print("✓ Created Windows launcher: launch_extension.bat")
        
    else:
        # Create shell script launcher
        shell_content = '''#!/bin/bash
cd "$(dirname "$0")"
python3 floating_translator.py
'''
        with open('launch_extension.sh', 'w') as f:
            f.write(shell_content)
        os.chmod('launch_extension.sh', 0o755)
        print("✓ Created Unix launcher: launch_extension.sh")

def main():
    print("🏛️ Setting up Floating Translator Extension...")
    print(f"Platform: {platform.system()}")
    
    if install_requirements():
        print("✓ All requirements installed")
    else:
        print("✗ Some requirements failed to install")
        return
    
    create_launcher()
    print("\n🎉 Setup complete!")
    print("\nTo run the extension:")
    
    if platform.system() == "Windows":
        print("  - Double-click 'launch_extension.bat'")
        print("  - Or run: python floating_translator.py")
    else:
        print("  - Run: ./launch_extension.sh")
        print("  - Or run: python3 floating_translator.py")

if __name__ == "__main__":
    main()