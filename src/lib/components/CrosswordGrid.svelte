<script lang="ts">
	import type { CellType, DirectionType } from '$lib/types/crossword';

	let {
		cells,
		width,
		height,
		direction,
		selectedCell,
		userInput,
		checkedState,
		handleCellClick
	}: {
		cells: CellType[];
		width: number;
		height: number;
		direction: DirectionType;
		selectedCell: number;
		userInput: Record<number, string>;
		checkedState: Record<number, boolean> | null;
		handleCellClick: (index: number, cell: CellType) => void;
	} = $props();

	const cellSize = 100 / Math.max(width, height);

	let selectedRow = $derived.by(() => Math.floor(selectedCell / width));
	let selectedColumn = $derived.by(() => selectedCell % width);

	function shouldHighlightCell(row: number, column: number) {
		if (!selectedCell) return false;

		if (direction === 'Across') {
			return row === selectedRow;
		}

		if (direction === 'Down') {
			return column === selectedColumn;
		}

		return false;
	}
</script>

<svg viewBox="0 0 100 100" class="mx-auto w-full max-w-xl border-2 border-black">
	{#each cells as cell, index}
		{@const row = Math.floor(index / width)}
		{@const col = index % width}
		{@const x = col * cellSize}
		{@const y = row * cellSize}
		{@const isBlock = !cell.answer}
		{@const isSelected = selectedCell === index}
		{@const isHighlighted = index !== selectedCell && cell.answer && shouldHighlightCell(row, col)}
		<g
			onclick={() => handleCellClick(index, cell)}
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
			{#if !isBlock && userInput[index]}
				<text
					class={checkedState?.[index]
						? 'correct-letter'
						: 'cell-letter'}
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
