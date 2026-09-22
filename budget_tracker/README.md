# Budget Tracker

A personal budget tracker built with React and Vite.

## Features

- Income, expenses, transfers, and transfer fees
- Accounts with balance history
- Monthly budgets and savings goals
- Dashboard summaries and Insights
- Custom income and expense categories
- Excel backup and restore
- Browser-local persistence
- Sign in, sign up, and sign out boundary ready for a hosted auth provider

## Local development

```powershell
npm install
npm run dev
```

Build and preview the production bundle locally:

```powershell
npm run build
npm run preview
```

## Privacy

The app stores budget data in the browser's `localStorage`. It does not send financial data to a server. Data is isolated to the browser and device where it was entered.

Authentication currently uses a local development adapter so the app can be designed and tested before Supabase is connected. This is not production authentication: local browser storage can be cleared or inspected by the device owner. The adapter boundary is in `src/auth/authStorage.js`; replace it with Supabase Auth before sharing the app with multiple users.

Excel backups are downloaded locally and are ignored by Git through `.gitignore`. Do not commit exported backups, `.env` files, credentials, or private personal data.

If deployed to GitHub Pages, the application code is public. Never put API keys, passwords, private tokens, or backend credentials in frontend source code because they would be visible to anyone who downloads the site.# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
