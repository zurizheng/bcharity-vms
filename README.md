# BCharity VMS

## About BCharity

BCharity is a community-driven, decentralized, and permissionless public good social media Web3.0 built on blockchains.

## Project

The frontend is using [Next.js](https://nextjs.org/) to provide tooling and configuration for React.

The backend is using [Lens React Hooks SDK](https://docs.lens.xyz/docs/sdk-react-getting-started) to interact with the Lens Protocol.

The monorepo is using [Turborepo](https://turborepo.org/) and [pnpm workspaces](https://pnpm.io/workspaces) to link packages together.

- [./packages/ui](./packages/ui): Exports UI components that use TypeScript and Tailwind CSS and is compiled by SWC.
- [./packages/utils](./packages/utils): Exports utility functions that use TypeScript.

## Setup

```bash
cd apps/app
cp .env.example .env
pnpm i
```

Next, run `app` in development mode:

```bash
pnpm dev
```

The app should be up and running at http://localhost:3000.
