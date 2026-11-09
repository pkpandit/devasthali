# Devasthaly admin preview

This independent Next.js App Router application provides placeholder content
workspaces based on the public website navigation.

## Local development only

```bash
npm ci
npm run dev
```

The server binds to loopback at http://localhost:3001. Open
http://localhost:3001/admin.

Authentication is not implemented. This shell is not production-ready and
must not be exposed publicly. It has no database connection, sensitive API,
or write operation. Do not deploy it until authentication and authorization
are implemented and reviewed.

## Checks

```bash
npx tsc --noEmit
npm run lint
npm run build
```

The public menu labels, order, hierarchy, and destination mapping live in
`lib/admin-navigation.ts`; the sidebar and route workspaces consume that
single definition. Public utility actions such as the phone link and fee
payment link are intentionally not shown as content editors.
