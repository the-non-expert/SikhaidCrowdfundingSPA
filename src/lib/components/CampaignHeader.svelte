<script lang="ts">
	interface CampaignHeaderProps {
		title?: string;
		organizer?: string;
		organizerUrl?: string;
		target?: number;
		raised?: number;
	}

	let {
		title = 'Help Rebuild Homes in Punjab',
		organizer = 'SikhAid India',
		organizerUrl = 'https://sikhaidindia.com',
		target = 10000000,
		raised = 3115067
	}: CampaignHeaderProps = $props();

	function shareWhatsApp() {
		const text = encodeURIComponent(`Help Rebuild Punjab - Emergency Relief Fund\n\nEvery donation helps rebuild lives and brings hope to flood-affected families.\n\nhttps://rebuildpunjab.sikhaid.com`);
		window.open(`https://wa.me/?text=${text}`, '_blank');
	}

	function spreadTheWord() {
		const text = encodeURIComponent('Help Rebuild Punjab - Emergency Relief Fund');
		const url = encodeURIComponent('https://rebuildpunjab.sikhaid.com');
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
			<div class="text-3xl font-bold text-teal-600 mb-1">₹{raised.toLocaleString('en-IN')}</div>
			<div class="text-gray-600 text-sm mb-4">raised out of ₹{target.toLocaleString('en-IN')}</div>

			<!-- Progress Bar -->
			<div class="w-full bg-gray-200 rounded-full h-2">
				<div
					class="bg-teal-500 h-2 rounded-full transition-all duration-1000 ease-out"
					style="width: {Math.min((raised / target) * 100, 100)}%"
				></div>
			</div>
		</div>
	</div>
</section>