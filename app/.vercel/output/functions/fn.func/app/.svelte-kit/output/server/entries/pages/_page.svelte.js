import { c as create_ssr_component, b as createEventDispatcher, a as add_attribute, o as onDestroy, d as each, v as validate_component } from "../../chunks/ssr.js";
import { c as client } from "../../chunks/client.js";
import imageUrlBuilder from "@sanity/image-url";
const Modal = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { isModalOpen } = $$props;
  let { images = [] } = $$props;
  let { currentImageIndex = 0 } = $$props;
  createEventDispatcher();
  if ($$props.isModalOpen === void 0 && $$bindings.isModalOpen && isModalOpen !== void 0) $$bindings.isModalOpen(isModalOpen);
  if ($$props.images === void 0 && $$bindings.images && images !== void 0) $$bindings.images(images);
  if ($$props.currentImageIndex === void 0 && $$bindings.currentImageIndex && currentImageIndex !== void 0) $$bindings.currentImageIndex(currentImageIndex);
  return `${isModalOpen ? `<div class="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50" aria-labelledby="modal-title" role="dialog" aria-modal="true"> <button type="button" class="absolute inset-0 w-full h-full cursor-pointer bg-transparent border-none p-0" aria-label="Close Modal" style="z-index: 10;" data-svelte-h="svelte-efy7ap"></button>  <button type="button" class="absolute top-0 left-0 w-1/3 h-full cursor-pointer" style="z-index: 30;" aria-label="Previous"></button>  <button type="button" class="absolute top-0 right-0 w-1/3 h-full cursor-pointer" style="z-index: 30;" aria-label="Next"></button>  <button type="button" class="fixed top-4 right-4 text-white text-4xl focus:outline-none" aria-label="Close" style="z-index: 9999;" data-svelte-h="svelte-kz3dan">×</button>  <button type="button" class="fixed top-1/2 left-4 transform -translate-y-1/2 text-white text-4xl focus:outline-none" aria-label="Previous" style="z-index: 9999;" data-svelte-h="svelte-qqh3oj">❮</button>  <button type="button" class="fixed top-1/2 right-4 transform -translate-y-1/2 text-white text-4xl focus:outline-none" aria-label="Next" style="z-index: 9999;" data-svelte-h="svelte-30v25t">❯</button>  <div class="relative max-w-6xl w-full px-4 pointer-events-none" style="z-index: 20;"><h2 id="modal-title" class="sr-only" data-svelte-h="svelte-un2xaz">Image Modal</h2> ${images && images.length > 0 ? `<img${add_attribute("src", images[currentImageIndex].asset.url, 0)}${add_attribute("alt", images[currentImageIndex].info || `Image ${currentImageIndex + 1}`, 0)} class="w-full h-auto max-h-[90vh] object-contain pointer-events-auto">` : ``}</div></div>` : ``}`;
});
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  const builder = imageUrlBuilder(client);
  function urlFor(source) {
    return builder.image(source);
  }
  let images = [];
  let isModalOpen = false;
  let currentImageIndex = 0;
  function handleKeydown(event) {
    return;
  }
  onDestroy(() => {
    if (typeof window !== "undefined") {
      window.removeEventListener("keydown", handleKeydown);
    }
  });
  {
    {
      if (typeof window !== "undefined") {
        window.removeEventListener("keydown", handleKeydown);
      }
    }
  }
  return `<section class="flex justify-center items-center bg-black w-full h-full overflow-auto"><div class="grid grid-cols-6 sm:grid-cols-12 gap-0.5 w-full max-h-full">${`${images && images.length > 0 ? `${each(images, (image, index) => {
    return `<button class="bg-black cursor-pointer p-0 m-0 border-none bg-transparent"${add_attribute("aria-label", "Open Image " + (index + 1), 0)}><img${add_attribute("src", urlFor(image).width(348).height(464).fit("crop").auto("format").url(), 0)}${add_attribute("alt", "Image " + (index + 1), 0)} class="w-full object-cover block" loading="lazy"> </button>`;
  })}` : `<p class="text-white text-center" data-svelte-h="svelte-gkmdoz">Loading...</p>`}`}</div></section> ${validate_component(Modal, "Modal").$$render($$result, { isModalOpen, images, currentImageIndex }, {}, {})}`;
});
export {
  Page as default
};
