# Devasthaly Vidyapeeth public website

This is the public Devasthaly Vidyapeeth website.

## Development

```bash
npm ci
npm run dev
```

The development server binds to loopback at http://localhost:3000.

## Checks

```bash
npx tsc --noEmit
npm run lint
npm run build
```

The former unauthenticated `/admin` mock has been retired. Administration
workspaces are a separate local-only application in `../backend`.
