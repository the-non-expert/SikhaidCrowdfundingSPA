<script lang="ts">
	import "../app.css";
	import favicon from "$lib/assets/favicon.svg";
	import WhatsAppButton from "$lib/components/WhatsAppButton.svelte";
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<main>
	<slot />
	<WhatsAppButton />
</main>
