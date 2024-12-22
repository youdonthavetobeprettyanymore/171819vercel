

export const index = 3;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/infoPage/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/3.DX1qf6ND.js","_app/immutable/chunks/scheduler.CGCkdKlw.js","_app/immutable/chunks/index.4mfom7CC.js"];
export const stylesheets = [];
export const fonts = [];
