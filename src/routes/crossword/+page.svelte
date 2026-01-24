<script lang="ts">
	import Grid from '$lib/components/Grid.svelte';
	import Title from '$lib/components/Title.svelte';
	import { crossword, type Cell, type Direction } from '$lib/stores/crossword';

	let focused = $state<{ row: number; column: number } | null>(null);
	let direction = $state<Direction>('across');

	function handleFocus(row: number, column: number) {
		focused = { row, column };
	}

	function isSelectedCell(rowIndex: number, columnIndex: number) {
		return focused?.row === rowIndex && focused?.column === columnIndex;
	}

	function shouldHighlightCell(rowIndex: number, columnIndex: number, cell: Cell) {
		if (!focused) return false;

		if (cell.isBlock) return false;

		if (isSelectedCell(rowIndex, columnIndex)) return false;

		if (direction === 'across') {
			return rowIndex === focused.row;
		}

		if (direction === 'down') {
			return columnIndex === focused.column;
		}

		return false;
	}

	function getIndex(number: number) {
		return number - 1;
	}

	function findNextCellFlow(
		startRow: number,
		startColumn: number,
		rowStep: number,
		columnStep: number
	) {
		const totalRows = $crossword.grid.length;
		const totalColumns = $crossword.grid[0].length;

		let nextRow = startRow;
		let nextColumn = startColumn;

		for (let attempts = 0; attempts < totalRows * totalColumns; attempts++) {
			nextRow += rowStep;
			nextColumn += columnStep;

			if (rowStep !== 0) {
				if (nextRow >= totalRows) {
					nextRow = 0;
					nextColumn += 1;
					if (nextColumn >= totalColumns) nextColumn = 0;
				}
				if (nextRow < 0) {
					nextRow = totalRows - 1;
					nextColumn -= 1;
					if (nextColumn < 0) nextColumn = totalColumns - 1;
				}
			} else if (columnStep !== 0) {
				if (nextColumn >= totalColumns) {
					nextColumn = 0;
					nextRow += 1;
					if (nextRow >= totalRows) nextRow = 0;
				}
				if (nextColumn < 0) {
					nextColumn = totalColumns - 1;
					nextRow -= 1;
					if (nextRow < 0) nextRow = totalRows - 1;
				}
			}

			const nextCell = $crossword.grid[nextRow][nextColumn];

			if (!nextCell.isBlock) {
				return { row: nextRow, column: nextColumn };
			}
		}

		return null;
	}

	function findFirstSquareInRow(rowIndex: number) {
		const totalColumns = $crossword.grid[0].length;
		const row = $crossword.grid[rowIndex];

		for (let columnIndex = 0; columnIndex < totalColumns; columnIndex++) {
			if (!row[columnIndex].isBlock) {
				return { row: rowIndex, column: columnIndex };
			}
		}
		return null;
	}

	function findFirstSquareInColumn(columnIndex: number) {
		const totalRows = $crossword.grid.length;

		for (let rowIndex = 0; rowIndex < totalRows; rowIndex++) {
			const cell = $crossword.grid[rowIndex][columnIndex];
			if (!cell.isBlock) {
				return { row: rowIndex, column: columnIndex };
			}
		}
		return null; 
	}

	$effect(() => {
		function onKeydown(event: KeyboardEvent) {
			if (!focused) return;

			const key = event.key.toUpperCase();

			if (!/^[A-Z]$/.test(key) && event.key !== 'Backspace') return;

			event.preventDefault();

			const { row, column } = focused;

			crossword.update((state) => {
				const cell = state.grid[row][column];
				if (!cell || cell.isBlock) return state;

				const newLetter = event.key === 'Backspace' ? '' : key;

				const newGrid = state.grid.map((rowArr, rowIndex) =>
					rowArr.map((cellItem, colIndex) =>
						rowIndex === row && colIndex === column ? { ...cellItem, letter: newLetter } : cellItem
					)
				);

				return { ...state, grid: newGrid };
			});

			if (event.key !== 'Backspace') {
				const totalRows = $crossword.grid.length;
				const totalColumns = $crossword.grid[0].length;

				if (direction === 'across') {
					if (column + 1 < totalColumns && !$crossword.grid[row][column + 1].isBlock) {
						focused = { row, column: column + 1 };
					}
				}

				if (direction === 'down') {
					if (row + 1 < totalRows && !$crossword.grid[row + 1][column].isBlock) {
						focused = { row: row + 1, column };
					}
				}
			} else {
				if (direction === 'across') {
					if (column > 0) {
						focused = { row, column: column - 1 };
					} else {
						const newRow = row > 0 ? row - 1 : $crossword.grid.length - 1;
						const newColumn = $crossword.grid[newRow].length - 1;
						focused = { row: newRow, column: newColumn };
					}
				}

				if (direction === 'down') {
					if (row > 0) {
						focused = { row: row - 1, column };
					} else {
						const newColumn = column > 0 ? column - 1 : $crossword.grid[0].length - 1;
						const newRow = $crossword.grid.length - 1;
						focused = { row: newRow, column: newColumn };
					}
				}
			}
		}

		window.addEventListener('keydown', onKeydown);
		return () => window.removeEventListener('keydown', onKeydown);
	});

	$effect(() => {
		function handleArrowKey(event: KeyboardEvent) {
			if (!focused) return;

			const totalRows = $crossword.grid.length;
			const totalColumns = $crossword.grid[0].length;
			const startingEdge = 0;

			let rowStep = 0;
			let columnStep = 0;

			switch (event.key) {
				case 'ArrowRight':
					event.preventDefault();
					if (direction === 'across') columnStep = 1;
					direction = 'across';
					break;

				case 'ArrowLeft':
					event.preventDefault();
					if (direction === 'across') columnStep = -1;
					direction = 'across';
					break;

				case 'ArrowDown':
					event.preventDefault();
					if (direction === 'down') rowStep = 1;
					direction = 'down';
					break;

				case 'ArrowUp':
					event.preventDefault();
					if (direction === 'down') rowStep = -1;
					direction = 'down';
					break;

				case 'Tab':
					event.preventDefault();
					const isBackwards = event.shiftKey;

					if (direction === 'across') {
						let nextRow = focused.row + (isBackwards ? -1 : 1);
						if (nextRow >= totalRows) nextRow = 0;
						if (nextRow < startingEdge) nextRow = getIndex(totalRows);
						const nextFocus = findFirstSquareInRow(nextRow);
						if (nextFocus) focused = nextFocus;
					}

					if (direction === 'down') {
						let nextColumn = focused.column + (isBackwards ? -1 : 1);
						if (nextColumn >= totalColumns) nextColumn = 0;
						if (nextColumn < startingEdge) nextColumn = getIndex(totalColumns);
						const nextFocus = findFirstSquareInColumn(nextColumn);
						if (nextFocus) focused = nextFocus;
					}
					return; // st

				default:
					return;
			}

			if ((direction === 'across' && columnStep !== 0) || (direction === 'down' && rowStep !== 0)) {
				const nextPosition = findNextCellFlow(focused.row, focused.column, rowStep, columnStep);

				if (nextPosition) {
					focused = nextPosition;
				}
			}
		}

		window.addEventListener('keydown', handleArrowKey);
		return () => window.removeEventListener('keydown', handleArrowKey);
	});
</script>

<Title>Play Ball!</Title>

<div class="flex justify-center gap-10">
	<Grid>
		{#each $crossword.grid as row, rowIndex}
			{#each row as column, columnIndex}
				{#if column.isBlock}
					<div class="bg-black select-none"></div>
				{:else}
					<div
						aria-label={`square-${rowIndex}-${columnIndex}`}
						class="relative flex items-center justify-center border border-black bg-white"
						class:selected={isSelectedCell(rowIndex, columnIndex)}
						class:highlighted={shouldHighlightCell(rowIndex, columnIndex, column)}
						onclick={() => handleFocus(rowIndex, columnIndex)}
					>
						{#if column.number}
							<div class="absolute top-1 left-1 text-center text-sm">{column.number}</div>
						{/if}
						{#if !column.isBlock}
							<div class="text-7xl select-none">{column.letter}</div>
						{/if}
					</div>
				{/if}
			{/each}
		{/each}
	</Grid>

	<div>
		<h2 class="rounded p-1 font-bold" class:current-direction={direction === 'across'}>Across</h2>
		<ul>
			{#each $crossword.clues.across as clue, i}
				<li
					class="my-1 flex items-center gap-2 rounded p-1"
					class:current-clue={direction === 'across' && focused?.row === i}
				>
					<span class="w-6 text-right font-semibold">{clue.number}.</span>
					{clue.clue}
				</li>
			{/each}
		</ul>
		<h2 class="rounded p-1 font-bold" class:current-direction={direction === 'down'}>Down</h2>
		<ul>
			{#each $crossword.clues.down as clue, i}
				<li
					class="my-1 flex items-center gap-2 rounded p-1"
					class:current-clue={direction === 'down' && focused?.column === i}
				>
					<span class="w-6 text-right font-semibold">{clue.number}.</span>
					{clue.clue}
				</li>
			{/each}
		</ul>
	</div>
</div>

<style>
	.selected {
		background-color: #ffda00;
	}

	.highlighted {
		background-color: #a7d8ff;
	}

	.current-direction {
		background-color: #fceb8f;
	}

	.current-clue {
		background-color: #a7d8ff;
	}
</style>
