import os
import time
from datetime import datetime

BRANCH = "main"

while True:
    # Check if there are changes
    status = os.popen("git status --porcelain").read().strip()
    
    if status:  # Only commit if changes exist
        print("🔄 Changes detected, pushing to GitHub...")
        os.system("git add .")
        os.system(f'git commit -m "Auto-commit: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}"')
        os.system(f"git push origin {BRANCH}")
        print("✅ Push complete!")
    else:
        print("⏳ No changes, waiting...")
    
    time.sleep(60)  # Check every 60 secondsseconds