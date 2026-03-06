# Kisaan Saathi - Implementation Tasks

## Critical Bug Fixes

- [x] Task 1: Create REQUIREMENTS.md, DESIGN.md, TASKS.md
- [x] Task 2: Fix dashboard.html - remove broken `/static/script.js` reference (causes 404)
- [x] Task 3: Fix crop-care.html - add missing `getLocation()` and `toggleLocationInput()` JS functions
- [x] Task 4: Fix weather_info.py - remove print(API_KEY) and code that runs at import time
- [x] Task 5: Add `folium` to requirements.txt (used by hotspot.py but missing)
- [x] Task 6: Add `PERPLEXITY_API_KEY` to .env.example
- [x] Task 7: Clean up unused files (_fix_paths.py, _fix2.py, write_app_helper.py)

## Feature Enhancements (from KisanSaathi Reference)

- [x] Task 8: Rewrite farmer-assistant.js with full features:
  - Language selector (9 languages) wired to UI dropdown
  - Voice input via Web Speech API (SpeechRecognition)
  - Text-to-Speech via Web Speech API (SpeechSynthesis)
  - Web search toggle (uses /api/web-search endpoint)
  - Markdown rendering via marked.js
  - Follow-up suggestion buttons extracted from AI responses
  - Chat history display with proper formatting
  - Loading states and error handling
- [x] Task 9: Add marked.js CDN to farmer-assistant.html for markdown rendering
- [x] Task 10: Fix crop-care.html - add error container missing from HTML (errorContainer/errorText)
- [x] Task 11: Fix market-analysis.html - use Jinja2 template variable instead of hardcoded API key
- [x] Task 12: Verify disease prediction Gemini fallback works correctly (code reviewed - works)
- [x] Task 13: Verify water footprint calculation fallback works correctly (code reviewed - works)

## Final Testing

- [x] Task 14: Install all Python dependencies
- [x] Task 15: Run the application and verify no import/startup errors
- [x] Task 16: Verify all page routes load correctly

## Status: Complete - All 16 tasks done
