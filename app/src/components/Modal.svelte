<script lang="ts">
  import { fade, scale } from 'svelte/transition';
  import { createEventDispatcher } from 'svelte';

  export let isModalOpen: boolean;
  export let images: any[] = [];
  export let currentImageIndex: number = 0;

  const dispatch = createEventDispatcher();

  function handleClose(event?: Event) {
    event && event.stopPropagation();
    dispatch('close');
  }

  function handleNext(event?: Event) {
    event && event.stopPropagation();
    dispatch('next');
  }

  function handlePrev(event?: Event) {
    event && event.stopPropagation();
    dispatch('prev');
  }

  function handleBackdropKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClose(e);
    }
  }
</script>

{#if isModalOpen}
  <div 
    class="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50"
    aria-labelledby="modal-title"
    role="dialog"
    aria-modal="true"
    transition:fade={{ duration: 300 }}
  >
    <!-- Close image if click on top or bottom of image. In addition to top rigt "X". -->
    <button 
      type="button"
      class="absolute inset-0 w-full h-full cursor-pointer bg-transparent border-none p-0"
      on:click={handleClose}
      on:keydown={handleBackdropKeydown}
      aria-label="Close Modal"
      style="z-index: 10;"
    >
    </button>

    <!-- 30% of screen on the left goes to previous image. -->
    <button 
      type="button"
      class="absolute top-0 left-0 w-1/3 h-full cursor-pointer"
      style="z-index: 30;"
      on:click|stopPropagation={handlePrev}
      aria-label="Previous"
    ></button>

    <!-- 30% of screen on the right goes to next image. -->
    <button 
      type="button"
      class="absolute top-0 right-0 w-1/3 h-full cursor-pointer"
      style="z-index: 30;"
      on:click|stopPropagation={handleNext}
      aria-label="Next"
    ></button>

    <!-- Normal close button on top right. -->
    <button 
      type="button"
      class="fixed top-4 right-4 text-white text-4xl focus:outline-none"
      on:click|stopPropagation={handleClose}
      aria-label="Close"
      style="z-index: 9999;"
    >
      &times;
    </button>

    <!-- Left arrow. -->
    <button 
      type="button"
      class="fixed top-1/2 left-4 transform -translate-y-1/2 text-white text-4xl focus:outline-none"
      on:click|stopPropagation={handlePrev}
      aria-label="Previous"
      style="z-index: 9999;"
    >
      &#10094;
    </button>

    <!-- Right arrow. -->
    <button 
      type="button"
      class="fixed top-1/2 right-4 transform -translate-y-1/2 text-white text-4xl focus:outline-none"
      on:click|stopPropagation={handleNext}
      aria-label="Next"
      style="z-index: 9999;"
    >
      &#10095;
    </button>

    <!-- Modal image container. -->
    <div 
      class="relative max-w-6xl w-full px-4 pointer-events-none" 
      style="z-index: 20;" 
      transition:scale={{ duration: 300 }}
    >
      <h2 id="modal-title" class="sr-only">Image Modal</h2>
      {#if images && images.length > 0}
        <img 
          src={images[currentImageIndex].asset.url} 
          alt={images[currentImageIndex].info || `Image ${currentImageIndex + 1}`} 
          class="w-full h-auto max-h-[90vh] object-contain pointer-events-auto"
        />
      {/if}
    </div>
  </div>
{/if}