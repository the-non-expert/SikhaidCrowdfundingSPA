<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	interface CarouselProps {
		images: string[];
		autoPlay?: boolean;
		interval?: number;
		showDots?: boolean;
		showArrows?: boolean;
	}

	let {
		images,
		autoPlay = true,
		interval = 3000,
		showDots = true,
		showArrows = true
	}: CarouselProps = $props();

	let currentIndex = $state(0);
	let intervalId: number | null = null;
	let isPaused = $state(false);

	function nextSlide() {
		currentIndex = (currentIndex + 1) % images.length;
	}

	function prevSlide() {
		currentIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
	}

	function goToSlide(index: number) {
		currentIndex = index;
	}

	function startAutoPlay() {
		if (autoPlay && !isPaused && images.length > 1) {
			intervalId = window.setInterval(nextSlide, interval);
		}
	}

	function stopAutoPlay() {
		if (intervalId) {
			clearInterval(intervalId);
			intervalId = null;
		}
	}

	function handleMouseEnter() {
		isPaused = true;
		stopAutoPlay();
	}

	function handleMouseLeave() {
		isPaused = false;
		startAutoPlay();
	}

	onMount(() => {
		startAutoPlay();
	});

	onDestroy(() => {
		stopAutoPlay();
	});

	$effect(() => {
		stopAutoPlay();
		startAutoPlay();
	});
</script>

<div
	class="relative w-full h-full overflow-hidden rounded-lg"
	onmouseenter={handleMouseEnter}
	onmouseleave={handleMouseLeave}
	role="region"
	aria-label="Image carousel"
>
	<!-- Images -->
	<div class="relative w-full h-full">
		{#each images as image, index}
			<div
				class="absolute inset-0 transition-opacity duration-500 ease-in-out"
				class:opacity-100={index === currentIndex}
				class:opacity-0={index !== currentIndex}
			>
				<img
					src={image}
					alt="Punjab relief campaign image {index + 1}"
					class="w-full h-full object-cover object-center"
					loading={index === 0 ? 'eager' : 'lazy'}
				/>
			</div>
		{/each}
	</div>

	<!-- Navigation Arrows -->
	{#if showArrows && images.length > 1}
		<button
			type="button"
			class="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 md:left-4"
			onclick={prevSlide}
			aria-label="Previous image"
		>
			<svg class="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
			</svg>
		</button>

		<button
			type="button"
			class="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 md:right-4"
			onclick={nextSlide}
			aria-label="Next image"
		>
			<svg class="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
			</svg>
		</button>
	{/if}

	<!-- Dots Navigation -->
	{#if showDots && images.length > 1}
		<div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
			{#each images as _, index}
				<button
					type="button"
					class="w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 {index === currentIndex ? 'bg-white' : 'bg-white/50'}"
					onclick={() => goToSlide(index)}
					aria-label="Go to slide {index + 1}"
				/>
			{/each}
		</div>
	{/if}

	<!-- Loading indicator for first image -->
	{#if images.length > 0}
		<div
			class="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center"
			class:hidden={currentIndex >= 0}
		>
			<div class="text-gray-500">
				<svg class="w-8 h-8 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
					/>
				</svg>
			</div>
		</div>
	{/if}
</div>