# RBAC POC

React + Vite frontend boilerplate with an axios API layer for RBAC.

## Stack

- React 19 + Vite
- Tailwind CSS v4
- Axios

## Getting started

```bash
npm install
cp .env.example .env
npm run dev
```

Set `VITE_API_BASE_URL` in `.env` to point at your backend API.

## API layer

```
src/services/
  api.js
  rolesService.js
  permissionsService.js
  usersService.js
  repositoriesService.js
  index.js
```
