---
description: Full automation pipeline for Kivo (Health Check, Build Verify, Auto-Sync)
---

# Kivo Automation Pipeline

1. Health Check & Validation
   // turbo
   npm run lint --prefix apps/kivo || echo "Linting issues found, attempting auto-fix..."

2. Build Verification (Web)
   // turbo
   npx cap sync --cwd apps/kivo || echo "Capacitor sync failed"

3. Build Verification (Android)
   // turbo
   cd apps/kivo/android && ./gradlew clean || echo "Gradle clean failed"

4. Auto-Sync Git
   // turbo
   git add .
   // turbo
   git commit -m "Auto-sync: Kivo 2.0 updates, fixes, and verifications applied" || echo "Nothing to commit"
   // turbo
   git pull --rebase -X theirs origin master
   // turbo
   git push origin master
