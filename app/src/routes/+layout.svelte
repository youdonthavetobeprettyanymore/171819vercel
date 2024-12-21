<!-- +layout.svelte -->
<script lang="ts">
  import { isPreviewing, VisualEditing } from '@sanity/visual-editing/svelte';
  import { page } from '$app/stores';
  import LiveMode from '../components/LiveMode.svelte';
</script>

{#if $isPreviewing}
  <a href={`/preview/disable?redirect=${$page.url.pathname}`} class="fixed right-4 bottom-4 bg-black shadow-md rounded-md text-gray-800 text-sm font-medium p-2 text-center z-50 hover:bg-red-500 hover:text-white">
    <span>Preview Enabled</span>
    <span class="hidden hover:inline">Disable Preview</span>
  </a>
{/if}

<div class="w-full h-screen flex flex-col">
  <header class="flex items-center px-4 bg-black text-white z-10">
    <a class="text-sm leading-none no-underline pt-4 pb-4" href="/">seventeeneightteennineteen</a>
    <a class="text-sm leading-none no-underline absolute right-4" href="/infoPage">info</a>
  </header>
  
  <main class="flex-grow w-full overflow-auto">
    <slot />
  </main>
  
  <footer class="flex justify-end items-center h-16 px-4 bg-black text-white">
    <p class="text-sm leading-none flex items-center gap-1 whitespace-nowrap">
      Made with 
      <svg
        data-sanity-icon="heart-filled"
        width="1em"
        height="1em"
        viewBox="0 0 25 25"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        class="inline-block"
      >
        <path
          d="M17 16C15.8 17.3235 12.5 20.5 12.5 20.5C12.5 20.5 9.2 17.3235 8 16C5.2 12.9118 4.5 11.7059 4.5 9.5C4.5 7.29412 6.1 5.5 8.5 5.5C10.5 5.5 11.7 6.82353 12.5 8.14706C13.3 6.82353 14.5 5.5 16.5 5.5C18.9 5.5 20.5 7.29412 20.5 9.5C20.5 11.7059 19.8 12.9118 17 16Z"
          fill="currentColor"
          stroke="currentColor"
          stroke-width="1.2"
        />
      </svg>
      at Sanity
    </p>
  </footer>
</div>

{#if false}
  <VisualEditing />
  <LiveMode />
{/if}