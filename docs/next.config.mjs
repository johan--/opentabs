import { withContentCollections } from '@content-collections/next';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: {
    // docs-v2 lives inside the opentabs monorepo; set the root explicitly
    // so Next.js doesn't walk up to the monorepo root and get confused by
    // its bun.lock when resolving workspace boundaries.
    root: import.meta.dirname,
  },
};

export default withContentCollections(nextConfig);
