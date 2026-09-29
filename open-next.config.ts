import { defineCloudflareConfig } from '@opennextjs/cloudflare';

// Every route is rendered per request, so no incremental cache, queue or
// tag cache is configured.
export default defineCloudflareConfig({});
