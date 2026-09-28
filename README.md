# legal-roster

Legal Roster is the Vue frontend. The sibling `../legal-roster-api` folder contains
the Go backend, API routes, database setup, and production static file server.

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
pnpm install
```

### Compile and Hot-Reload for Development

```sh
pnpm dev
```

Run the Go API from the sibling folder in a second terminal:

```sh
cd ../legal-roster-api
go run ./cmd/server
```

The Vite dev server proxies `/api` requests to `http://localhost:8080`.

### Type-Check, Compile and Minify for Production

```sh
pnpm build
```

Then run the sibling backend, which serves this app from `dist/`:

```sh
cd ../legal-roster-api
go run ./cmd/server
```

Useful backend endpoints:

- `GET /api/health`
- `GET /api/candidates`
- `POST /api/candidates`
- `GET /api/jobs/{slug}`
- `POST /api/jobs/{slug}/applications`
- `GET /api/admin/jobs`
- `PATCH /api/admin/jobs/{id}/status`
- `GET /api/admin/applicants`
- `PATCH /api/admin/applicants/{id}/status`
- `POST /api/admin/applicants/{id}/hire`

Example candidate payload:

```json
{
  "name": "Avery Chen",
  "role": "Contracts specialist",
  "focus": "Commercial terms",
  "score": 94,
  "status": "Ready"
}
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
pnpm test:unit
```

### Lint with [ESLint](https://eslint.org/)

```sh
pnpm lint
```
