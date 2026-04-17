# AGENTS.md

## Project goals
- Build a personal diary website for local-first use.
- Frontend must work standalone.
- AI analysis must be optional and degrade gracefully when backend is unavailable.

## Tech preferences
- Use React + TypeScript + Vite.
- Use Tailwind CSS for styling.
- Prefer IndexedDB for diary persistence.
- Prefer lightweight dependencies.
- Use Node.js + Express only for local AI proxy.

## Working rules
- Do not expose API keys in frontend code.
- Do not introduce auth unless explicitly requested.
- Do not add heavy backend infrastructure.
- Keep components readable and modular.
- Prefer simple data flow over clever abstractions.
- Use Chinese UI copy by default.

## Verification
- Run the app locally after changes if possible.
- Ensure CRUD works.
- Ensure frontend does not crash when backend is missing.
- Ensure export/import works.
- Ensure AI analysis is manually triggered only.

## UX
- Calm, soft, personal writing space.
- Avoid admin-dashboard styling.
- Prioritize writing and review experience.