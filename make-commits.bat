@echo off
setlocal enabledelayedexpansion

echo ========================================================
echo Creating 11 Modular Commits for Shuchithwam Project
echo ========================================================
echo.

:: 0. Configure git ignore and unstage any unwanted caches
git rm -r --cached node_modules .next >nul 2>&1
git add .gitignore

:: Commit 1: Project Architecture & Styling Foundation
git add .gitignore package.json tsconfig.json next.config.ts postcss.config.mjs components.json lib/utils.ts public/ .env.example
git commit -m "feat(setup): initialize project architecture, config, and styling foundation"
echo [1/11] feat(setup): initialize project architecture, config, and styling foundation

:: Commit 2: Data Models & Types
git add src/types/
git commit -m "feat(types): define unified data models and ER diagram entities"
echo [2/11] feat(types): define unified data models and ER diagram entities

:: Commit 3: Config & Constants
git add src/config/
git commit -m "feat(config): isolate environment configurations and domain constants"
echo [3/11] feat(config): isolate environment configurations and domain constants

:: Commit 4: Error Handling & Utilities
git add src/lib/errors/ src/lib/utils/
git commit -m "feat(utils): add standardized error handling and geolocation utilities"
echo [4/11] feat(utils): add standardized error handling and geolocation utilities

:: Commit 5: Database Schema & Repository
git add src/lib/db/
git commit -m "feat(database): implement database schema, seed data, and central repository store"
echo [5/11] feat(database): implement database schema, seed data, and central repository store

:: Commit 6: IoT Verification Engine & Telemetry Simulator
git add src/lib/iot/ scripts/test-iot-verification.js scripts/iot-telemetry-simulator.js
git commit -m "feat(iot): implement machine runtime verification engine and telemetry simulator"
echo [6/11] feat(iot): implement machine runtime verification engine and telemetry simulator

:: Commit 7: State Management & Hooks
git add src/context/ src/hooks/
git commit -m "feat(state): add centralized React state providers and reactive hooks"
echo [7/11] feat(state): add centralized React state providers and reactive hooks

:: Commit 8: Modular UI Component Library
git add components/
git commit -m "feat(components): build modular UI components, camera capture, GPS, and voice recorder"
echo [8/11] feat(components): build modular UI components, camera capture, GPS, and voice recorder

:: Commit 9: Scalable REST API Architecture
git add app/api/ src/lib/export/
git commit -m "feat(api): implement scalable REST API gateway and operational export controllers"
echo [9/11] feat(api): implement scalable REST API gateway and operational export controllers

:: Commit 10: Multi-Role Application Portals
git add app/
git commit -m "feat(portals): build Worker mobile portal, Supervisor dashboard, and Admin console"
echo [10/11] feat(portals): build Worker mobile portal, Supervisor dashboard, and Admin console

:: Commit 11: Documentation & Standalone App Runner
git add README.md server.js run.bat test.bat simulate-iot.bat make-commits.bat
git commit -m "docs: add comprehensive operational documentation and standalone app runner"
echo [11/11] docs: add comprehensive operational documentation and standalone app runner

echo.
echo ========================================================
echo ✅ All 11 modular commits created successfully!
echo ========================================================
