import * as universal from '../entries/pages/_layout.ts.js';
import * as server from '../entries/pages/_layout.server.ts.js';

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/+layout.ts";
export { server };
export const server_id = "src/routes/+layout.server.ts";
export const imports = ["_app/immutable/nodes/0.1s_5kZ4n.js","_app/immutable/chunks/entry.Ds-QqVx2.js","_app/immutable/chunks/scheduler.CGCkdKlw.js","_app/immutable/chunks/index.4mfom7CC.js","_app/immutable/chunks/stores.CTqbqNqS.js","_app/immutable/chunks/client.X89VUMzK.js","_app/immutable/chunks/preload-helper.C1FmrZbK.js"];
export const stylesheets = [];
export const fonts = [];
