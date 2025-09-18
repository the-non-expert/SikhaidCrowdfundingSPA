<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	// Payment details from URL parameters
	let paymentId = '';
	let donorName = '';
	let amount = '';
	let loading = true;

	onMount(() => {
		// Get payment details from URL search params
		const urlParams = $page.url.searchParams;
		paymentId = urlParams.get('payment_id') || '';
		donorName = urlParams.get('donor_name') || 'Anonymous Donor';
		amount = urlParams.get('amount') || '0';

		// If no payment info, redirect to home
		if (!paymentId) {
			goto('/');
			return;
		}

		loading = false;
	});

	function goHome() {
		goto('/');
	}

	function shareSuccess() {
		const text = `I just donated ₹${amount} to help rebuild Punjab! Join me in supporting flood-affected families. Every contribution matters! 🙏`;
		const url = window.location.origin;

		if (navigator.share) {
			navigator.share({
				title: 'I just donated to Rebuild Punjab!',
				text: text,
				url: url
			});
		} else {
			// Fallback to WhatsApp
			const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text + '\n\n' + url)}`;
			window.open(whatsappUrl, '_blank');
		}
	}
</script>

<svelte:head>
	<title>Payment Successful - Thank You! | Rebuild Punjab</title>
	<meta name="description" content="Thank you for your generous donation to help rebuild Punjab. Your contribution will make a real difference." />
</svelte:head>

{#if loading}
	<div class="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
		<div class="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
	</div>
{:else}
	<div class="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4">
		<div class="max-w-2xl mx-auto text-center">
			<!-- Success Animation Container -->
			<div class="mb-8 relative">
				<!-- Celebration Particles -->
				<div class="absolute inset-0 overflow-hidden">
					{#each Array(12) as _, i}
						<div
							class="absolute w-2 h-2 bg-green-400 rounded-full animate-pulse"
							style="
								left: {Math.random() * 100}%;
								top: {Math.random() * 100}%;
								animation-delay: {i * 0.1}s;
								animation-duration: {1.5 + Math.random()}s;
							"
						></div>
					{/each}
				</div>

				<!-- Success Checkmark -->
				<div class="relative z-10 inline-flex items-center justify-center w-24 h-24 bg-green-500 rounded-full mx-auto mb-6 animate-bounce">
					<svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
					</svg>
				</div>
			</div>

			<!-- Success Message -->
			<div class="bg-white rounded-2xl shadow-2xl p-8 md:p-12 mb-8">
				<h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
					🎉 Payment Successful!
				</h1>

				<p class="text-xl text-gray-600 mb-8">
					Thank you, <span class="font-semibold text-green-600">{donorName}</span>!<br/>
					Your generous donation will help rebuild lives in Punjab.
				</p>

				<!-- Payment Details Card -->
				<div class="bg-gray-50 rounded-xl p-6 mb-8">
					<h2 class="text-lg font-semibold text-gray-800 mb-4">Payment Details</h2>

					<div class="space-y-3 text-left">
						<div class="flex justify-between items-center">
							<span class="text-gray-600">Amount Donated:</span>
							<span class="font-bold text-2xl text-green-600">₹{parseInt(amount).toLocaleString('en-IN')}</span>
						</div>

						<div class="flex justify-between items-center">
							<span class="text-gray-600">Payment ID:</span>
							<span class="font-mono text-sm text-gray-800 bg-gray-200 px-2 py-1 rounded">
								{paymentId.slice(0, 20)}...
							</span>
						</div>

						<div class="flex justify-between items-center">
							<span class="text-gray-600">Status:</span>
							<span class="inline-flex items-center gap-1 text-green-600 font-medium">
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
								</svg>
								Confirmed
							</span>
						</div>
					</div>
				</div>

				<!-- Impact Message -->
				<div class="bg-blue-50 rounded-xl p-6 mb-8">
					<h3 class="text-lg font-semibold text-blue-900 mb-3">Your Impact</h3>
					<div class="text-blue-800 space-y-2">
						{#if parseInt(amount) >= 10000}
							<p>🏠 Your donation can help rebuild a flood-damaged home!</p>
						{:else if parseInt(amount) >= 2000}
							<p>🛠️ Your donation can provide basic shelter materials for a family!</p>
						{:else if parseInt(amount) >= 500}
							<p>🍽️ Your donation can provide emergency food for a family!</p>
						{:else}
							<p>💝 Every donation, no matter the size, makes a difference!</p>
						{/if}
						<p class="text-sm">Thank you for being part of the solution.</p>
					</div>
				</div>

				<!-- Action Buttons -->
				<div class="flex flex-col sm:flex-row gap-4 justify-center">
					<button
						onclick={shareSuccess}
						class="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
						</svg>
						Share Your Good Deed
					</button>

					<button
						onclick={goHome}
						class="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
					>
						Back to Campaign
					</button>
				</div>
			</div>

			<!-- Additional Info -->
			<div class="text-center text-gray-600">
				<p class="mb-2">
					<strong>Receipt:</strong> A confirmation email will be sent to you shortly.
				</p>
				<p class="text-sm">
					For any queries, contact us at
					<a href="mailto:sikhaidcharity@gmail.com" class="text-blue-600 hover:underline">
						sikhaidcharity@gmail.com
					</a>
				</p>
			</div>
		</div>
	</div>
{/if}

<style>
	@keyframes float {
		0%, 100% { transform: translateY(0px); }
		50% { transform: translateY(-10px); }
	}

	.animate-float {
		animation: float 3s ease-in-out infinite;
	}
</style>