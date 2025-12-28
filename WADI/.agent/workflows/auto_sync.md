---
description: Automatically sync project changes to GitHub (Add, Commit, Pull-Rebase, Push)
---

1. Stage all changes
   // turbo
   git add .

2. Commit changes
   // turbo
   git commit -m "Auto-sync: updates applied" || echo "Nothing to commit"

3. Pull updates from remote (rebase, preferring local changes on conflict)
   // turbo
   git pull --rebase -X theirs origin master

4. Push changes to remote
   // turbo
   git push origin master
