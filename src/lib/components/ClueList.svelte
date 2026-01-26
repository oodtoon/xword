<script lang="ts">
	import type { MiniCrossword } from '$lib/mini-crossword/mini-crossword.svelte';
	import type { DirectionType } from '$lib/types/crossword';
	import { getContext } from 'svelte';

	const gameContext: MiniCrossword = getContext('game');

	let { clueDirection }: { clueDirection: DirectionType } = $props();
</script>

<ol>
	<h2 class="text-2xl font-bold underline">
		{clueDirection}
	</h2>
	{#each gameContext.clues as clue}
		{#if clue.direction === clueDirection}
			<li
				class="my-1 flex gap-2 rounded px-4"
				class:highlighted-clue={clue === gameContext.currentClue}
			>
				<span
					class="flex w-6 justify-center rounded px-2 font-semibold"
					class:highlighted-clue={clue === gameContext.altClue}>{clue.label}.</span
				>
				<span>{clue.text[0].plain}</span>
			</li>
		{/if}
	{/each}
</ol>
