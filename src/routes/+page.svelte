<script lang="ts">
	import Arrow from '$lib/components/icons/Arrow.svelte';
	import CrosswordIcon from '$lib/components/icons/CrosswordIcon.svelte';
	import HourGlass from '$lib/components/icons/HourGlass.svelte';
	import LinkButton from '$lib/components/LinkButton.svelte';
	import Title from '$lib/components/Title.svelte';
	import { slide } from 'svelte/transition';

	let isDateSelectShowing = $state<boolean>(false);
	let selectedDate = $state<string | null>(null);
	const today = new Date();
	const yyyy = today.getFullYear();
	const mm = String(today.getMonth() + 1).padStart(2, '0');
	const dd = String(today.getDate()).padStart(2, '0');

	const todaysFormattedDate = `${yyyy}-${mm}-${dd}`;

	function toggleDateSelect() {
		isDateSelectShowing = !isDateSelectShowing;
	}

	function selectDate(e: Event) {
		selectedDate = (e.target as HTMLInputElement).value;
	}
</script>

<Title>Build Your Own Mini Crossword!</Title>
<div class="mx-auto grid max-w-lg grid-cols-2 gap-x-6 gap-y-2">
	<LinkButton href="/setup/blocks">
		<div class="flex items-center h-full">
			<span class="m-auto">
				Create Puzzle
			</span>
		</div>
	</LinkButton>
	<LinkButton href={`/nyt${selectedDate ? `?${new URLSearchParams({ date: selectedDate })}` : ''}`}>
		<div class="flex items-center h-full">
			<span class="m-auto flex gap-2">
				Play NYT Mini
			</span>
			<CrosswordIcon />
		</div>
	</LinkButton>
	<div></div>
	<button
		onclick={toggleDateSelect}
		class="flex h-6 cursor-pointer items-center justify-center gap-6
		       border-b border-white"
	>
		<HourGlass width="14" height="14" />
		Time Travel
		<Arrow
			width="18"
			height="18"
			className="transition-transform duration-300 ease-in-out
		       {isDateSelectShowing ? 'rotate-90' : 'rotate-0'}"
		/>
	</button>

	{#if isDateSelectShowing}
		<div></div>
		<div transition:slide class="overflow-hidden">
			<label for="date">Date</label>
			<input
				type="date"
				id="date"
				min="2015-01-01"
				max={todaysFormattedDate}
				class="date"
				onchange={selectDate}
			/>
		</div>
	{/if}
</div>
