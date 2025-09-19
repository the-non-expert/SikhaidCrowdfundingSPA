<script lang="ts">
	import HeroSection from '$lib/components/HeroSection.svelte';
	import CampaignHeader from '$lib/components/CampaignHeader.svelte';
	import DonationForm from '$lib/components/DonationForm.svelte';
	import AboutCampaign from '$lib/components/AboutCampaign.svelte';
	import Footer from '$lib/components/Footer.svelte';
</script>

<svelte:head>
	<title>Rebuild Punjab - Emergency Relief Fund | Donate Now</title>
	<meta name="description" content="Join the Rebuild Punjab campaign to provide emergency relief to flood-affected families. Every donation helps rebuild lives, homes, and communities. Donate securely. Target: �30,00,000." />
</svelte:head>

<!-- Hero Section with Clean Image Carousel -->
<HeroSection />

<!-- Campaign Header with Title and CTA -->
<CampaignHeader
	title="Help Rebuild Homes in Punjab"
	organizer="SikhAid India"
	organizerUrl="https://sikhaidindia.com"
	target={1500000}
	raised={0}
/>

<!-- Donation Form Section -->
<DonationForm />

<!-- About Campaign Section -->
<AboutCampaign />

<!-- Footer -->
<Footer />