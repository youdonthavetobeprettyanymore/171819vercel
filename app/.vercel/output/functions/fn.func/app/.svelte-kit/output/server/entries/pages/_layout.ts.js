import { s as setPreviewing } from "../../chunks/previewStore.js";
const load = (event) => {
  const { preview } = event.data;
  setPreviewing(preview);
};
export {
  load
};
