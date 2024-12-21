<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { client } from '$lib/sanity/client';
  import Modal from '../components/Modal.svelte';
  import imageUrlBuilder from '@sanity/image-url';

  // KEEP THIS HERE. URL IMAGE BUILDER NEEDS TO BE BEFORE EVERYTHING.
  const builder = imageUrlBuilder(client);
  function urlFor(source) {
    return builder.image(source);
  }

  let images = [];
  let isModalOpen = false;
  let currentImageIndex = 0;
  let error: string | null = null;

  onMount(async () => {
    try {
      const data = await client.fetch(`*[_type == "photoshoot" && title == "Landing Page Images"]{
        title,
        thumbnails[]{
          asset->{
            _id,
            url
          },
          crop,
          hotspot,
          info
        }
      }`);

      if (data && data.length > 0) {
        images = data[0].thumbnails || [];
      } else {
        error = 'No images found.';
      }
    } catch (err) {
      console.error('Sanity Fetch Error:', err);
      error = 'Failed to load images.';
    }
  });

  function openModal(index: number) {
    currentImageIndex = index;
    isModalOpen = true;
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
  }

  function closeModal() {
    isModalOpen = false;
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'auto';
    }
  }

  function showPrevious(event?: Event) {
    event && event.stopPropagation();
    currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
  }

  function showNext(event?: Event) {
    event && event.stopPropagation();
    currentImageIndex = (currentImageIndex + 1) % images.length;
  }

  function handleKeydown(event: KeyboardEvent) {
    if (!isModalOpen) return;
    if (event.key === 'ArrowLeft') {
      showPrevious();
    } else if (event.key === 'ArrowRight') {
      showNext();
    } else if (event.key === 'Escape') {
      closeModal();
    }
  }

  onMount(() => {
    if (isModalOpen) {
      window.addEventListener('keydown', handleKeydown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeydown);
    };
  });

  $: if (isModalOpen) {
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', handleKeydown);
    }
  } else {
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', handleKeydown);
    }
  }

  onDestroy(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', handleKeydown);
    }
  });
</script>

<section class="flex justify-center items-center bg-black w-full h-full overflow-auto">
  <div class="grid grid-cols-6 sm:grid-cols-12 gap-0.5 w-full max-h-full">
    {#if error}
      <p class="text-red-500 text-center">{error}</p>
    {:else if images && images.length > 0}
      {#each images as image, index}
        <button 
          class="bg-black cursor-pointer p-0 m-0 border-none bg-transparent"
          on:click={() => openModal(index)}
          aria-label={"Open Image " + (index + 1)}
        >
          <img 
            src={urlFor(image)
              .width(348)
              .height(464)
              .fit('crop')
              .auto('format')
              .url()} 
            alt={"Image " + (index + 1)} 
            class="w-full object-cover block" 
            loading="lazy"
          />
        </button>
      {/each}
    {:else}
      <p class="text-white text-center">Loading...</p>
    {/if}
  </div>
</section>

<Modal 
  {isModalOpen} 
  {images} 
  {currentImageIndex} 
  on:close={closeModal} 
  on:next={showNext} 
  on:prev={showPrevious} 
/>