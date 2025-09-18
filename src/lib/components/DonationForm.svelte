<script lang="ts">
	import { goto } from '$app/navigation';

	let donationAmount = $state('');
	let fullName = $state('');
	let donorEmail = $state('');
	let donorPhone = $state('');
	let isProcessing = $state(false);

	// TypeScript interface for Razorpay
	interface RazorpayOptions {
		key: string;
		amount: number;
		currency: string;
		name: string;
		description: string;
		order_id: string;
		handler: (response: any) => void;
		prefill: {
			name: string;
			email?: string;
			contact?: string;
		};
		notes: Record<string, string>;
		theme: {
			color: string;
		};
		modal: {
			ondismiss: () => void;
		};
	}


	async function handleDonate() {
		// Basic validation
		if (!donationAmount || parseFloat(donationAmount) < 10) {
			alert('Please enter a minimum donation amount of ₹10');
			return;
		}
		if (!fullName.trim()) {
			alert('Please enter your full name');
			return;
		}

		try {
			isProcessing = true;

			// Call our Netlify function to create Razorpay order
			const response = await fetch('/.netlify/functions/create-order', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					amount: parseFloat(donationAmount),
					name: fullName,
					email: donorEmail,
					phone: donorPhone
				})
			});

			if (!response.ok) {
				throw new Error(`Failed to create order: ${response.status}`);
			}

			const orderData = await response.json();

			if (!orderData.success) {
				throw new Error(orderData.error || 'Failed to create payment order');
			}

			// Initialize Razorpay checkout
			const options: RazorpayOptions = {
				key: orderData.razorpay_key_id,
				amount: orderData.order.amount,
				currency: orderData.order.currency,
				name: orderData.campaign_info.name,
				description: `Donation for ${orderData.campaign_info.name}`,
				order_id: orderData.order.id,
				handler: function (response: any) {
					// Payment successful - redirect to success page
					console.log('Payment successful:', response);

					// Reset form
					donationAmount = '';
					fullName = '';
					donorEmail = '';
					donorPhone = '';
					isProcessing = false;

					// Redirect to success page with payment details
					const successUrl = `/success?payment_id=${response.razorpay_payment_id}&donor_name=${encodeURIComponent(fullName)}&amount=${donationAmount}`;
					goto(successUrl);
				},
				prefill: {
					name: fullName,
					email: donorEmail,
					contact: donorPhone
				},
				notes: {
					campaign: 'youtuber_rebuild_punjab',
					source: 'donation_form',
					donor_name: fullName
				},
				theme: {
					color: '#7c3aed'
				},
				modal: {
					ondismiss: function () {
						console.log('Checkout form closed by user');
						isProcessing = false;
					}
				}
			};

			const razorpay = new (window as any).Razorpay(options);
			razorpay.open();

		} catch (error) {
			console.error('Error processing donation:', error);
			const errorMessage = error instanceof Error ? error.message : 'Please try again';
			alert(`Error processing donation: ${errorMessage}`);
			isProcessing = false;
		}
	}
</script>

<section id="donate" class="bg-white py-12">
	<div class="max-w-6xl mx-auto px-4">
		<!-- Header -->
		<div class="text-center mb-8">
			<h2 class="text-2xl font-bold text-purple-700 mb-2">Contribute</h2>
		</div>

		<!-- Main Container: Form + QR Code -->
		<div class="flex flex-col md:flex-row md:space-x-8 space-y-8 md:space-y-0">
			<!-- Donation Form -->
			<div class="flex-1">
				<div class="bg-white rounded-lg p-6 shadow-lg border max-w-md mx-auto md:mx-0">

					<!-- Donation Form -->
					<form onsubmit={(e) => { e.preventDefault(); handleDonate(); }} class="space-y-6">
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
							disabled={isProcessing}
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
						disabled={isProcessing}
					/>
				</div>

				<!-- Email (Optional) -->
				<div>
					<label for="donorEmail" class="block text-sm font-medium text-gray-700 mb-2 text-center">
						Email (Optional)
					</label>
					<input
						id="donorEmail"
						type="email"
						bind:value={donorEmail}
						placeholder="Enter your email"
						class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
						disabled={isProcessing}
					/>
					<p class="text-xs text-gray-500 text-center mt-1">For donation receipt</p>
				</div>

				<!-- Phone (Optional) -->
				<div>
					<label for="donorPhone" class="block text-sm font-medium text-gray-700 mb-2 text-center">
						Phone (Optional)
					</label>
					<input
						id="donorPhone"
						type="tel"
						bind:value={donorPhone}
						placeholder="Enter your phone number"
						class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
						disabled={isProcessing}
					/>
					<p class="text-xs text-gray-500 text-center mt-1">For payment updates</p>
				</div>

						<!-- Donate Button -->
						<button
							type="submit"
							disabled={isProcessing}
							class="w-full bg-purple-700 hover:bg-purple-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 text-lg"
						>
							{#if isProcessing}
								Processing...
							{:else}
								Donate Now
							{/if}
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

			<!-- QR Code Section -->
			<div class="flex-1">
				<div class="bg-white rounded-lg p-6 shadow-lg border max-w-md mx-auto md:mx-0">
					<div class="text-center">
						<h3 class="text-xl font-bold text-purple-700 mb-4">Quick Payment</h3>
						<p class="text-gray-600 mb-6">Scan QR code to pay instantly</p>

						<!-- QR Code Image -->
						<div class="flex justify-center mb-6">
							<div class="bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-300">
								<img
									src="/images/QrImage.jpeg"
									alt="QR Code for Payment"
									class="w-64 h-464 object-cover"
								/>
								<!-- Placeholder when image not found -->
								<div class="hidden w-48 h-48 flex items-center justify-center text-gray-400 text-sm">
									<div class="text-center">
										<svg class="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v14a2 2 0 002 2z" />
										</svg>
										<p>Place QR code image<br/>in static/images/qr-code.png</p>
									</div>
								</div>
							</div>
						</div>

						<!-- Instructions -->
						<div class="space-y-2 text-sm text-gray-600">
							<div class="flex items-center gap-2">
								<span class="w-2 h-2 bg-purple-500 rounded-full"></span>
								<span>Open any UPI app (GPay, PhonePe, Paytm)</span>
							</div>
							<div class="flex items-center gap-2">
								<span class="w-2 h-2 bg-purple-500 rounded-full"></span>
								<span>Scan the QR code above</span>
							</div>
							<div class="flex items-center gap-2">
								<span class="w-2 h-2 bg-purple-500 rounded-full"></span>
								<span>Enter your donation amount</span>
							</div>
							<div class="flex items-center gap-2">
								<span class="w-2 h-2 bg-purple-500 rounded-full"></span>
								<span>Complete the payment</span>
							</div>
						</div>

						<!-- QR Code Benefits -->
						<div class="mt-6 p-4 bg-green-50 rounded-lg">
							<div class="flex items-center gap-2 text-green-700 text-sm font-medium mb-2">
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
								</svg>
								<span>Quick & Easy</span>
							</div>
							<p class="text-green-600 text-xs">No form filling required. Just scan and pay!</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>