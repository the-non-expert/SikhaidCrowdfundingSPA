<script lang="ts">
	import { onMount } from 'svelte';

	interface CampaignHeaderProps {
		title?: string;
		organizer?: string;
		organizerUrl?: string;
		target?: number;
		raised?: number;
	}

	interface CampaignStats {
		campaign: string;
		total_amount: number;
		donation_count: number;
		target: number;
		progress_percentage: number;
		last_updated: string;
	}

	let {
		title = 'Help Rebuild Homes in Punjab',
		organizer = 'SikhAid India',
		organizerUrl = 'https://sikhaidindia.com',
		target = 3000000,
		raised = 0
	}: CampaignHeaderProps = $props();

	let campaignStats = $state<CampaignStats | null>(null);
	let isLoadingStats = $state(true);
	let statsError = $state<string | null>(null);

	// Use dynamic stats if available, otherwise fall back to props
	const actualRaised = $derived(campaignStats?.total_amount ?? raised);
	const actualTarget = $derived(campaignStats?.target ?? target);
	const donationCount = $derived(campaignStats?.donation_count ?? 0);

	async function fetchCampaignStats() {
		try {
			isLoadingStats = true;
			statsError = null;

			const response = await fetch('/.netlify/functions/get-campaign-stats');

			if (!response.ok) {
				throw new Error(`Failed to fetch stats: ${response.status}`);
			}

			const data = await response.json();

			if (data.success && data.data) {
				campaignStats = data.data;
				console.log('📊 Campaign stats loaded:', campaignStats);
			} else {
				throw new Error('Invalid stats response');
			}
		} catch (error) {
			console.error('❌ Error fetching campaign stats:', error);
			statsError = 'Failed to load latest stats';
			// Keep using fallback values (props)
		} finally {
			isLoadingStats = false;
		}
	}

	onMount(() => {
		fetchCampaignStats();
	});

	function shareWhatsApp() {
		const text = encodeURIComponent(`Help Rebuild Punjab - Emergency Relief Fund\n\nEvery donation helps rebuild lives and brings hope to flood-affected families.\n\nhttps://rebuildpunjab.sikhaidindia.com`);
		window.open(`https://wa.me/?text=${text}`, '_blank');
	}

	function spreadTheWord() {
		const text = encodeURIComponent('Help Rebuild Punjab - Emergency Relief Fund');
		const url = encodeURIComponent('https://rebuildpunjab.sikhaidindia.com');
		window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`, '_blank');
	}
</script>

<section class="bg-white py-6">
	<div class="max-w-md mx-auto px-4">
		<!-- Campaign Title and Organizer -->
		<div class="text-center mb-6">
			<h1 class="text-xl font-bold text-gray-900 mb-2 leading-tight">
				{title}: Emergency Relief Fund for Flood-Affected Families
			</h1>
			<p class="text-sm text-gray-600">
				by <a
					href={organizerUrl}
					target="_blank"
					rel="noopener noreferrer"
					class="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors duration-200"
				>
					{organizer}
				</a>
			</p>
		</div>

		<!-- Share Buttons -->
		<div class="flex gap-3 mb-4">
			<button
				type="button"
				onclick={shareWhatsApp}
				class="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-2 py-2 rounded-full text-sm font-medium transition-colors duration-200 flex-1 justify-center"
			>
				Share via WhatsApp
			</button>

			<button
				type="button"
				onclick={spreadTheWord}
				class="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full text-sm font-medium transition-colors duration-200 flex-1 justify-center"
			>
				Share via Facebook
			</button>
		</div>

		<!-- Social Media Impact -->
		<div class="text-center mb-6">
			<p class="text-gray-600 text-sm">Every Social Media share can bring ₹ 5,000</p>
		</div>

		<!-- Fundraising Progress -->
		<div class="text-center">
			{#if isLoadingStats}
				<div class="text-3xl font-bold text-gray-400 mb-1 animate-pulse">Loading...</div>
				<div class="text-gray-400 text-sm mb-4">Fetching latest stats...</div>
			{:else}
				<div class="text-3xl font-bold text-teal-600 mb-1">₹{actualRaised.toLocaleString('en-IN')}</div>
				<div class="text-gray-600 text-sm mb-4">
					raised out of ₹{actualTarget.toLocaleString('en-IN')}
					{#if donationCount > 0}
						<span class="text-gray-500">• {donationCount} donations</span>
					{/if}
				</div>
			{/if}

			{#if statsError}
				<div class="text-xs text-amber-600 mb-2">⚠️ {statsError}</div>
			{/if}

			<!-- Progress Bar -->
			<div class="w-full bg-gray-200 rounded-full h-2">
				<div
					class="bg-teal-500 h-2 rounded-full transition-all duration-1000 ease-out"
					style="width: {Math.min((actualRaised / actualTarget) * 100, 100)}%"
				></div>
			</div>

			{#if campaignStats?.last_updated}
				<div class="text-xs text-gray-500 mt-2">
					Last updated: {new Date(campaignStats.last_updated).toLocaleString('en-IN')}
				</div>
			{/if}
		</div>
	</div>
</section>