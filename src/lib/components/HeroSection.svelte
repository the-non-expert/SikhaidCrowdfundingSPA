<script lang="ts">
	import ImageCarousel from './ImageCarousel.svelte';

	const heroImages = [
		'/images/Image1.JPG',
		'/images/Image2.JPG',
		'/images/Image3.JPG'
	];
</script>

<section class="w-full h-[400px] sm:h-[500px] md:h-[600px] overflow-hidden">
	<ImageCarousel
		images={heroImages}
		autoPlay={true}
		interval={3000}
		showDots={true}
		showArrows={true}
	/>
</section>