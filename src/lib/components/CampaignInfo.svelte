<script lang="ts">
	interface CampaignInfoProps {
		title?: string;
		organizer?: string;
		organizerUrl?: string;
		target?: number;
		raised?: number;
		donorCount?: number;
		daysLeft?: number;
	}

	let {
		title = 'Help Rebuild Homes in Punjab',
		organizer = 'SikhAid India',
		organizerUrl = 'https://sikhaidindia.com',
		target = 3000000,
		raised = 450000,
		donorCount = 127,
		daysLeft = 19
	}: CampaignInfoProps = $props();

	// Calculate progress percentage
	const progressPercentage = Math.min((raised / target) * 100, 100);

	// Format currency
	function formatCurrency(amount: number): string {
		if (amount >= 10000000) {
			return `₹${(amount / 10000000).toFixed(1)}Cr`;
		} else if (amount >= 100000) {
			return `₹${(amount / 100000).toFixed(1)}L`;
		} else if (amount >= 1000) {
			return `₹${(amount / 1000).toFixed(0)}K`;
		}
		return `₹${amount.toLocaleString('en-IN')}`;
	}

	// Format number with commas
	function formatNumber(num: number): string {
		return num.toLocaleString('en-IN');
	}
</script>

<section class="bg-white py-8 sm:py-12">
	<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
		<!-- Campaign Title and Organizer -->
		<div class="text-center mb-8">
			<h2 class="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
				{title}
			</h2>
			<p class="text-lg text-gray-600">
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

		<!-- Progress Section -->
		<div class="bg-gray-50 rounded-xl p-6 sm:p-8 mb-8">
			<!-- Progress Bar -->
			<div class="mb-6">
				<div class="flex justify-between items-center mb-2">
					<span class="text-sm font-medium text-gray-700">Progress</span>
					<span class="text-sm font-medium text-gray-700">{progressPercentage.toFixed(1)}%</span>
				</div>
				<div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
					<div
						class="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-1000 ease-out"
						style="width: {progressPercentage}%"
					></div>
				</div>
			</div>

			<!-- Stats Grid -->
			<div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
				<!-- Amount Raised -->
				<div class="text-center sm:text-left">
					<div class="text-2xl sm:text-3xl font-bold text-green-600 mb-1">
						{formatCurrency(raised)}
					</div>
					<div class="text-sm text-gray-600">raised</div>
				</div>

				<!-- Target Amount -->
				<div class="text-center sm:text-left">
					<div class="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
						{formatCurrency(target)}
					</div>
					<div class="text-sm text-gray-600">target</div>
				</div>

				<!-- Donors Count -->
				<!-- <div class="text-center sm:text-left">
					<div class="text-2xl sm:text-3xl font-bold text-blue-600 mb-1">
						{formatNumber(donorCount)}
					</div>
					<div class="text-sm text-gray-600">donors</div>
				</div> -->
			</div>

			<!-- Days Left -->
			{#if daysLeft > 0}
				<div class="mt-6 text-center">
					<div class="inline-flex items-center bg-orange-100 text-orange-800 px-4 py-2 rounded-full">
						<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						<span class="font-medium">{daysLeft} days left</span>
					</div>
				</div>
			{/if}
		</div>

		<!-- Call to Action -->
		<div class="text-center">
			<button
				type="button"
				class="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-12 rounded-lg text-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-green-500/50 mb-4"
			>
				Contribute Now
			</button>
			<p class="text-sm text-gray-600 max-w-md mx-auto">
				Every donation helps rebuild lives and brings hope to flood-affected families in Punjab.
			</p>
		</div>

		<!-- Impact Statement -->
		<div class="mt-12 bg-blue-50 rounded-xl p-6 sm:p-8">
			<h3 class="text-xl sm:text-2xl font-bold text-blue-900 mb-4 text-center">
				Your Impact Matters
			</h3>
			<div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
				<div>
					<div class="text-3xl font-bold text-blue-600 mb-2">₹500</div>
					<div class="text-sm text-blue-800">provides emergency food for a family</div>
				</div>
				<div>
					<div class="text-3xl font-bold text-blue-600 mb-2">₹2,000</div>
					<div class="text-sm text-blue-800">supplies basic shelter materials</div>
				</div>
				<div>
					<div class="text-3xl font-bold text-blue-600 mb-2">₹10,000</div>
					<div class="text-sm text-blue-800">helps rebuild a flood-damaged home</div>
				</div>
			</div>
		</div>
	</div>
</section>