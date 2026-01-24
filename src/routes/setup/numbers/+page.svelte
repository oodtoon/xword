<script lang="ts">
	import { crossword, type CrosswordState } from '$lib/stores/crossword';
	import Grid from '$lib/components/Grid.svelte';
	import LinkButton from '$lib/components/LinkButton.svelte';
	import Title from '$lib/components/Title.svelte';

	// auto-derive store in Svelte 5
	let data = $derived(crossword);

	// update the temporary manual clue number
	function setNumber(r: number, c: number, value: string) {
		crossword.update((old) => {
			const newGrid = old.grid.map((row, ri) =>
				row.map((cell, ci) =>
					ri === r && ci === c ? { ...cell, number: value === '' ? null : Number(value) } : cell
				)
			);

			return { ...old, grid: newGrid };
		});
	}

	function shouldShowNumberInput(r: number, c: number): boolean {
		const cell = $data.grid[r][c];
		if (cell.isBlock) return false;

		const startsDown = r === 0 || $data.grid[r - 1][c].isBlock;
		const startsAcross = c === 0 || $data.grid[r][c - 1].isBlock;

		return startsDown || startsAcross;
	}

	function autoNumberGrid() {
		crossword.update((old) => {
			let counter = 1;

			const newGrid = old.grid.map((row, r) =>
				row.map((cell, c) => {
					// If it's a block, clear number
					if (cell.isBlock) {
						return { ...cell, number: null };
					}

					const startsAcross =
						(c === 0 || old.grid[r][c - 1].isBlock) && // left is edge or block
						c + 1 < old.cols; // there's space to the right

					const startsDown =
						(r === 0 || old.grid[r - 1][c].isBlock) && // above is edge or block
						r + 1 < old.rows; // there's space below

					if (startsAcross || startsDown) {
						const newNumber = counter;
						counter++;
						return { ...cell, number: newNumber };
					}

					// Otherwise clear number
					return { ...cell, number: null };
				})
			);

			return { ...old, grid: newGrid };
		});
	}

	$effect(() => {
		autoNumberGrid();
	});
</script>

<Title>Step 2: Add Numbers</Title>
<div class="flex justify-center">
	<Grid>
		{#each $data.grid as row, r}
			{#each row as cell, c}
				{#if cell.isBlock}
					<!-- BLOCK SQUARE -->
					<div class="border border-black bg-black"></div>
				{:else}
					<!-- NON-BLOCK WITH SMALL NUMBER INPUT -->
					<div class="relative border border-black bg-white">
						{#if shouldShowNumberInput(r, c)}
							<input
								id={`number-${r}-${c}`}
								type="text"
								inputmode="numeric"
								maxlength="2"
								class="absolute top-1 left-1 m-0 h-6 w-6 min-w-0 rounded-sm border p-0 text-center text-xs"
								value={cell.number ?? ''}
								oninput={(e) => setNumber(r, c, (e.target as HTMLInputElement).value)}
							/>
						{/if}
					</div>
				{/if}
			{/each}
		{/each}
	</Grid>
</div>

<div class="flex justify-center m-4">
	<LinkButton href="/setup/blocks">Back: Reassign Blocks</LinkButton>
	<LinkButton href="/setup/clues">Next: Add Clues →</LinkButton>
</div>
