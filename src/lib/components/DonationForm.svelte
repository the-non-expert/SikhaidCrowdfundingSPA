<script lang="ts">
	let donationAmount = $state('');
	let fullName = $state('');

	function handleDonate() {
		// Basic validation
		if (!donationAmount || parseFloat(donationAmount) < 10) {
			alert('Please enter a minimum donation amount of ₹10');
			return;
		}
		if (!fullName.trim()) {
			alert('Please enter your full name');
			return;
		}

		// Here you would integrate with Razorpay
		console.log('Donation details:', { amount: donationAmount, name: fullName });
		alert('Donation functionality will be integrated with Razorpay payment gateway');
	}
</script>

<section id="donate" class="bg-white py-12">
	<div class="max-w-md mx-auto px-4">
		<div class="bg-white rounded-lg p-6 shadow-lg border">
			<!-- Header -->
			<div class="text-center mb-8">
				<h2 class="text-2xl font-bold text-purple-700 mb-2">Contribute</h2>
			</div>

			<!-- Donation Form -->
			<form on:submit|preventDefault={handleDonate} class="space-y-6">
				<!-- Donation Amount -->
				<div>
					<label for="amount" class="block text-sm font-medium text-gray-700 mb-2 text-center">
						Donation Amount
					</label>
					<div class="relative">
						<span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
						<input
							id="amount"
							type="number"
							min="10"
							step="1"
							bind:value={donationAmount}
							placeholder="0"
							class="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
							required
						/>
					</div>
					<p class="text-xs text-gray-500 text-center mt-1">Minimum amount: ₹10</p>
				</div>

				<!-- Full Name -->
				<div>
					<label for="fullName" class="block text-sm font-medium text-gray-700 mb-2 text-center">
						Full Name
					</label>
					<input
						id="fullName"
						type="text"
						bind:value={fullName}
						placeholder="Enter your full name"
						class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
						required
					/>
				</div>

				<!-- Donate Button -->
				<button
					type="submit"
					class="w-full bg-purple-700 hover:bg-purple-800 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 text-lg"
				>
					Donate Now
				</button>
			</form>

			<!-- Security Info -->
			<div class="mt-6 text-center">
				<div class="flex items-center justify-center gap-2 mb-2">
					<svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
					</svg>
					<span class="text-xs text-gray-600">Secure payment powered by Razorpay</span>
				</div>
				<p class="text-xs text-gray-500">Your payment information is encrypted and secure</p>
			</div>

			<!-- Payment Methods -->
			<div class="mt-6">
				<p class="text-sm text-gray-700 text-center mb-3">Secure payments powered by Razorpay:</p>
				<div class="flex justify-center gap-4 text-xs">
					<span class="bg-orange-100 text-orange-800 px-2 py-1 rounded">UPI</span>
					<span class="bg-blue-100 text-blue-800 px-2 py-1 rounded">Cards</span>
					<span class="bg-red-100 text-red-800 px-2 py-1 rounded">Net Banking</span>
					<span class="bg-purple-100 text-purple-800 px-2 py-1 rounded">Wallets</span>
				</div>
			</div>
		</div>
	</div>
</section>