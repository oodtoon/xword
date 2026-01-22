<script lang="ts">
	import ClueInput from '$lib/components/ClueInput.svelte';
	import Grid from '$lib/components/Grid.svelte';
	import LinkButton from '$lib/components/LinkButton.svelte';
	import {
		crossword,
		type Cell,
		type Clue,
		type Clues,
		type Direction
	} from '$lib/stores/crossword';

	let data = $derived(crossword);

	function generateCluesFromGrid(grid: Cell[][]): Clues {
		const across: Clue[] = [];
		const down: Clue[] = [];

		const rows = grid.length;
		const cols = grid[0].length;

		for (let r = 0; r < rows; r++) {
			for (let c = 0; c < cols; c++) {
				const cell = grid[r][c];
				if (cell.isBlock || cell.number == null) continue;

				const num = cell.number;

				// Starts ACROSS if left is edge or block AND there's a letter to the right
				const startsAcross =
					(c === 0 || grid[r][c - 1].isBlock) && c + 1 < cols && !grid[r][c + 1].isBlock;

				if (startsAcross) {
					across.push({
						direction: 'across',
						number: num,
						clue: ''
					});
				}

				// Starts DOWN if top is edge or block AND there's a letter below
				const startsDown =
					(r === 0 || grid[r - 1][c].isBlock) && r + 1 < rows && !grid[r + 1][c].isBlock;

				if (startsDown) {
					down.push({
						direction: 'down',
						number: num,
						clue: ''
					});
				}
			}
		}

		return { across, down };
	}

	function updateClue(direction: Direction, number: number, value: string) {
		crossword.update((s) => {
			return {
				...s,
				clues: {
					...s.clues,
					[direction]: s.clues[direction].map((cl) =>
						cl.number === number ? { ...cl, clue: value } : cl
					)
				}
			};
		});
	}

	$effect(() => {
		crossword.update((state) => {
			// Only generate clues when they are empty (first visit)
			if (state.clues.across.length === 0 && state.clues.down.length === 0) {
				const clues = generateCluesFromGrid(state.grid);
				return { ...state, clues };
			}
			return state; // Do NOT overwrite user clues
		});
	});
</script>

<div class="flex justify-center gap-10">
	<Grid>
		{#each $data.grid as row, r}
			{#each row as cell, c}
				<div
					aria-label={`square-${r}-${c}`}
					class="relative flex items-center justify-center border border-black
  {cell.isBlock ? 'bg-black' : 'bg-white'}"
				>
					{#if cell.number}
						<div class="absolute top-1 left-1 text-center text-sm">{cell.number}</div>
					{/if}
				</div>
			{/each}
		{/each}
	</Grid>
	<div class="mr-20 w-100">
		<h2 class="mt-4 text-lg font-bold">Across</h2>
		<ul>
			{#each $data.clues.across as clue}
				<li class="my-1 flex items-center gap-2">
					<span class="w-6 text-right font-semibold">{clue.number}.</span>

					<input
						class="flex-1 rounded border p-1"
						value={clue.clue}
						oninput={(e) => {
							updateClue('across', clue.number, e.target?.value);
						}}
					/>
				</li>
			{/each}
		</ul>
		<h2 class="mt-4 text-lg font-bold">Down</h2>
		<ul>
			{#each $data.clues.down as clue}
				<li class="my-1 flex items-center gap-2">
					<span class="w-6 text-right font-semibold">{clue.number}.</span>

					<input
						class="flex-1 rounded border p-1"
						value={clue.clue}
						oninput={(e) => {
							updateClue('down', clue.number, e.target?.value);
						}}
					/>
				</li>
			{/each}
		</ul>
	</div>
</div>

<LinkButton href="/setup/numbers">Back: Reassign Numbers</LinkButton>
<LinkButton href="/">PLAY!</LinkButton>
