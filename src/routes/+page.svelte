<script lang="ts">
	import Arrow from '$lib/components/icons/Arrow.svelte';
	import CrosswordIcon from '$lib/components/icons/CrosswordIcon.svelte';
	import HourGlass from '$lib/components/icons/HourGlass.svelte';
	import LinkButton from '$lib/components/LinkButton.svelte';
	import Title from '$lib/components/Title.svelte';
	import { slide } from 'svelte/transition';

	let isDateSelectShowing = $state<boolean>(false);
	let selectedDate = $state<string | null>(null);
	let isOffline = $state<boolean>(false);
	let offlineGameType = $state<string | null>(null);
	const today = new Date();
	const yyyy = today.getFullYear();
	const mm = String(today.getMonth() + 1).padStart(2, '0');
	const dd = String(today.getDate()).padStart(2, '0');

	const todaysFormattedDate = `${yyyy}-${mm}-${dd}`;

	const offlineGameTypes = [
		{ label: 'Multi Row Game', value: 'multi' },
		{ label: 'Full Board Game', value: 'full' }
	];

	function toggleDateSelect() {
		isDateSelectShowing = !isDateSelectShowing;
	}

	function selectDate(e: Event) {
		selectedDate = (e.target as HTMLInputElement).value;
	}

	$effect(() => {
		if (!isOffline) {
			offlineGameType = null;
		}
	});
</script>

<Title>Build Your Own Mini Crossword!</Title>
<div class="mx-auto grid max-w-lg grid-cols-2 gap-x-6 gap-y-2">
	<LinkButton
		href={`/nyt?size=mini${selectedDate ? `&${new URLSearchParams({ date: selectedDate })}` : offlineGameType ? `&${new URLSearchParams({ offlineGameType })}` : ''}`}
	>
		<div class="flex h-full items-center">
			<span class="m-auto flex gap-2"> Play MINI</span>
			<CrosswordIcon />
		</div>
	</LinkButton>
	<LinkButton href="/nyt?size=midi">
		<div class="flex h-full items-center">
			<span class="m-auto flex gap-2"> Play MIDI</span>
			<CrosswordIcon />
		</div>
	</LinkButton>
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

	<LinkButton href="/setup/blocks">
		<div class="flex h-full items-center">
			<span class="m-auto"> Create Puzzle</span>
		</div>
	</LinkButton>
	<div>
		<label for="offline-data-checkbox">I am offline</label>
		<input type="checkbox" id="offline-data-checkbox" bind:checked={isOffline} />
	</div>

	{#if isOffline}
		<div></div>
		<div class="flex flex-col">
			{#each offlineGameTypes as gameType}
				<label for={gameType.value} class="flex justify-between">
					{gameType.label}
					<input
						type="radio"
						id={gameType.value}
						value={gameType.value}
						name="offline-game-type"
						bind:group={offlineGameType}
					/>
				</label>
			{/each}
		</div>
	{/if}
</div>
