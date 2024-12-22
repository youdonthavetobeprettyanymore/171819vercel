import { a as readonly, w as writable } from "./index2.js";
const previewStore = writable(false);
const isPreviewing = readonly(previewStore);
const setPreviewing = previewStore.set;
export {
  isPreviewing as i,
  setPreviewing as s
};
