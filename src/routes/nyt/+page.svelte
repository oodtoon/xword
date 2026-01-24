<script lang="ts">
	import Title from '$lib/components/Title.svelte';
	import { type CellType } from '$lib/types/crossword';
	let { data } = $props();

	const { cells, dimensions, clues } = data.game.body['0'];
	const { width, height } = dimensions;
	const cellSize = 100 / Math.max(dimensions.width, dimensions.height);
	let selectedCell = $state<number | null>(null);
	let userInput = $state<Record<number, string>>({});
	// console.log(data.game.body['0']);

	function handleCellClick(index: number, cell: CellType) {
		if (cell.answer) {
			selectedCell = index;
		}
	}

	function handleArrowKey(e: KeyboardEvent) {
		e.preventDefault();
		let newIndex = selectedCell!;
		const currentRow = Math.floor(selectedCell! / width);
		const currentCol = selectedCell! % width;

		if (e.key === 'ArrowUp') {
			newIndex = currentRow === 0 ? (height - 1) * width + currentCol : selectedCell! - width;
		} else if (e.key === 'ArrowDown') {
			newIndex =
				currentRow === height - 1
					? currentCol // Wrap to top
					: selectedCell + width;
		} else if (e.key === 'ArrowLeft') {
			newIndex = currentCol === 0 ? selectedCell + width - 1 : selectedCell! - 1;
		} else if (e.key === 'ArrowRight') {
			newIndex = currentCol === width - 1 ? selectedCell! - width + 1 : selectedCell! + 1;
		}

		if (cells[newIndex]?.answer) {
			selectedCell = newIndex;
		}
	}

	function handleBackspace() {
		delete userInput[selectedCell!];
	}

	function handleLetterPress(key: string) {
		userInput[selectedCell!] = key;
	}

	function handleKeyPress(e: KeyboardEvent) {
		if (selectedCell === null) return;

		if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
			handleArrowKey(e);
			return;
		}

		if (e.key === 'Backspace') {
			handleBackspace();
			return;
		}

		const key = e.key.toUpperCase();
		if (key.length === 1 && key >= 'A' && key <= 'Z') {
			handleLetterPress(key);
		}
	}

	$effect(() => {
		window.addEventListener('keydown', handleKeyPress);
		return () => window.removeEventListener('keydown', handleKeyPress);
	});
</script>

<Title>Mini Crossword!</Title>

<div class="flex p-10">
	<svg viewBox="0 0 100 100" class="mx-auto w-full max-w-xl border-2 border-black">
		{#each cells as cell, index}
			{@const row = Math.floor(index / dimensions.width)}
			{@const col = index % dimensions.width}
			{@const x = col * cellSize}
			{@const y = row * cellSize}
			{@const isBlack = !cell.answer}
			{@const isSelected = selectedCell === index}
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<g
				onclick={() => handleCellClick(index, cell)}
				style="cursor: {isBlack ? 'default' : 'pointer'}"
			>
				<rect
					x="{x}%"
					y="{y}%"
					width="{cellSize}%"
					height="{cellSize}%"
					class="{isBlack ? 'block' : isSelected ? 'cell-selected' : 'cell'} cell-border"
					stroke-width="0.3"
				/>
				{#if cell.label}
					<text
						class="cell-label select-none"
						x="{x + 0.5}%"
						y="{y + 2.5}%"
						font-size="2"
						font-family="Arial, sans-serif"
					>
						{cell.label}
					</text>
				{/if}
				{#if !isBlack && userInput[index]}
					<text
						class="cell-letter"
						x="{x + cellSize / 2}%"
						y="{y + cellSize / 2 + 1.5}%"
						font-size="12"
						text-anchor="middle"
						dominant-baseline="middle"
					>
						{userInput[index]}
					</text>
				{/if}
			</g>
		{/each}
	</svg>

	<div class="flex flex-col gap-10">
		<ol>
			<h2 class="text-2xl font-bold underline">Across</h2>
			{#each clues as clue}
				{#if clue.direction === 'Across'}
					<li class="my-1 flex gap-2">
						<span class="w-6 font-semibold">{clue.label}</span>
						<span>{clue.text[0].plain}</span>
					</li>
				{/if}
			{/each}
		</ol>
		<ol>
			<h2 class="text-2xl font-bold underline">Down</h2>
			{#each clues as clue}
				{#if clue.direction === 'Down'}
					<li class="my-1 flex gap-2">
						<span class="w-6 font-semibold">{clue.label}</span>
						<span>{clue.text[0].plain}</span>
					</li>
				{/if}
			{/each}
		</ol>
	</div>
</div>
