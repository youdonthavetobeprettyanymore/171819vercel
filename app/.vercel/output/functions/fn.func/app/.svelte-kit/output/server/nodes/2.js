import * as server from '../entries/pages/_page.server.ts.js';

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/+page.server.ts";
export const imports = ["_app/immutable/nodes/2.Cjczb3Yt.js","_app/immutable/chunks/scheduler.CGCkdKlw.js","_app/immutable/chunks/index.4mfom7CC.js","_app/immutable/chunks/client.X89VUMzK.js","_app/immutable/chunks/preload-helper.C1FmrZbK.js"];
export const stylesheets = [];
export const fonts = [];
