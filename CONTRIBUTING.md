# Contributing

Use Node.js 24 and npm to install and validate the action:

```sh
npm ci
npm run lint
```

GitHub Actions runs the checked-in `dist/index.js` bundle. After changing source code or dependencies, regenerate it with:

```sh
npm run build
```

Commit the resulting `dist/` changes with the source changes. Do not edit generated files in `dist/` by hand.
