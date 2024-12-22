

export const index = 4;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/photoshoot/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/4.C7NSFVw1.js","_app/immutable/chunks/scheduler.CGCkdKlw.js","_app/immutable/chunks/index.4mfom7CC.js"];
export const stylesheets = [];
export const fonts = [];
