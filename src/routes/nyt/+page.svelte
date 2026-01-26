<script lang="ts">
	import ClueList from '$lib/components/ClueList.svelte';
	import CrosswordGrid from '$lib/components/CrosswordGrid.svelte';
	import Dialog from '$lib/components/Dialog.svelte';
	import { MiniCrossword } from '$lib/mini-crossword/mini-crossword.svelte.js';
	import { setContext } from 'svelte';
	let { data } = $props();

	const game = new MiniCrossword(data.game.body['0']);
	setContext('game', game);

	$effect(() => {
		window.addEventListener('keydown', game.handleKeyPress);
		return () => window.removeEventListener('keydown', game.handleKeyPress);
	});
</script>

<Dialog bind:isOpen={game.isWin} />
<div class="flex justify-center gap-10 p-10">
	<div class="flex w-xl flex-col items-center gap-4">
		<div
			class="highlighted-clue mx-auto flex h-16 w-full max-w-xl items-center gap-2 rounded px-6 py-2"
		>
			<h3 class="w-20 font-semibold">{game.currentClue.label} {game.currentClue.direction}</h3>
			{game.currentClue?.text[0].plain}
		</div>
		<CrosswordGrid />
	</div>

	<div class="flex flex-col">
		<button onclick={game.checkPuzzle} class="check-puzzle-btn ml-auto cursor-pointer rounded p-2"
			>Check Puzzle</button
		>
		<div class="flex flex-col gap-10">
			<ClueList clueDirection={'Across'} />
			<ClueList clueDirection={'Down'} />
		</div>
	</div>
</div>
