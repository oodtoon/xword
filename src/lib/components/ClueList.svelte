<script lang="ts">
	import type { ClueType, DirectionType } from '$lib/types/crossword';

	let {
		clues,
		currentClue,
		altClue,
		clueDirection
	}: { clues: ClueType[]; currentClue: ClueType; altClue: ClueType; clueDirection: DirectionType } =
		$props();
</script>

<ol>
	<h2 class="text-2xl font-bold underline">
		{clueDirection}
	</h2>
	{#each clues as clue}
		{#if clue.direction === clueDirection}
			<li class="my-1 flex gap-2 rounded px-4" class:highlighted-clue={clue === currentClue}>
				<span
					class="flex w-6 justify-center rounded px-2 font-semibold"
					class:highlighted-clue={clue === altClue}>{clue.label}.</span
				>
				<span>{clue.text[0].plain}</span>
			</li>
		{/if}
	{/each}
</ol>
