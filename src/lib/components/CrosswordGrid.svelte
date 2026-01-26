<script lang="ts">
	import { type MiniCrossword } from '$lib/mini-crossword/mini-crossword.svelte';
	import { getContext } from 'svelte';

	const gameContext: MiniCrossword = getContext('game');
	const { cells, width, height } = gameContext;

	const cellSize = 100 / Math.max(width, height);

	let selectedRow = $derived.by(() => Math.floor(gameContext.selectedCellIndex / width));
	let selectedColumn = $derived.by(() => gameContext.selectedCellIndex % width);

	function shouldHighlightCell(row: number, column: number) {
		if (!gameContext.selectedCellIndex) return false;

		if (gameContext.direction === 'Across') {
			return row === selectedRow;
		}

		if (gameContext.direction === 'Down') {
			return column === selectedColumn;
		}

		return false;
	}
</script>

<svg viewBox="0 0 100 100" class="mx-auto w-full max-w-md border-2 border-black">
	{#each cells as cell, index}
		{@const row = Math.floor(index / width)}
		{@const col = index % width}
		{@const x = col * cellSize}
		{@const y = row * cellSize}
		{@const isBlock = !cell.answer}
		{@const isSelected = gameContext.selectedCellIndex === index}
		{@const isHighlighted =
			index !== gameContext.selectedCellIndex && cell.answer && shouldHighlightCell(row, col)}
		<g
			onclick={() => gameContext.handleCellClick(index, cell)}
			style="cursor: {isBlock ? 'default' : 'pointer'}"
		>
			<rect
				x="{x}%"
				y="{y}%"
				width="{cellSize}%"
				height="{cellSize}%"
				class="{isBlock
					? 'block'
					: isSelected
						? 'cell-selected'
						: isHighlighted
							? 'highlighted'
							: 'cell'} cell-border"
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
			{#if !isBlock && gameContext.userInput[index]}
				<text
					class={gameContext.checkedState?.[index] && gameContext.userInput[index] === cell.answer
						? 'correct-letter'
						: 'cell-letter'}
					x="{x + cellSize / 2}%"
					y="{y + cellSize / 2 + 1.5}%"
					font-size="12"
					text-anchor="middle"
					dominant-baseline="middle"
				>
					{gameContext.userInput[index]}
				</text>
				{#if gameContext.checkedState?.[index] === false}
					<line
						x1={x}
						y1={y + cellSize}
						x2={x + cellSize}
						y2={y}
						stroke="#dc2626"
						stroke-width="0.4"
						stroke-linecap="round"
						pointer-events="none"
					/>
				{/if}
			{/if}
		</g>
	{/each}
</svg>
