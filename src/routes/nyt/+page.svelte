<script lang="ts">
	import Title from '$lib/components/Title.svelte';
	import { type CellType, type DirectionType } from '$lib/types/crossword';
	let { data } = $props();

	const { cells, dimensions, clues } = data.game.body['0'];
	const { width, height } = dimensions;
	const totalCells = width * height;
	const cellSize = 100 / Math.max(dimensions.width, dimensions.height);

	let selectedCell = $state<number | null>(null);
	let userInput = $state<Record<number, string>>({});
	let direction = $state<DirectionType>('Across');
	// console.log(data.game.body['0']);

	function handleCellClick(index: number, cell: CellType) {
		if (cell.answer) {
			selectedCell = index;
		}
	}

	function shouldHighlightCell(row: number, column: number) {
		if (!selectedCell) return false;

		const selectedRow = Math.floor(selectedCell / width);
		const selectedColumn = selectedCell % width;

		if (direction === 'Across') {
			return row === selectedRow;
		}

		if (direction === 'Down') {
			return column === selectedColumn;
		}

		return false;
	}

	function selectToRight(newIndex: number) {
		return (newIndex + 1) % totalCells;
	}

	function selectToLeft(newIndex: number) {
		return (newIndex - 1 + totalCells) % totalCells;
	}

	function selectDown(currentCol: number) {
		return (currentCol + 1) % width;
	}

	function selectUp(currentCol: number) {
		return (height - 1) * width + ((currentCol - 1 + width) % width);
	}

	function findNextAvailableCell(startIndex: number, step: number, limit: number): number | null {
		for (let i = 0; i < limit; i++) {
			const checkIndex = startIndex + i * step;
			if (cells[checkIndex]?.answer) {
				return checkIndex;
			}
		}
		return null;
	}

	function getNextLine(e: KeyboardEvent, currentLine: number, totalLines: number) {
		const reverse = e.shiftKey;
		return reverse ? (currentLine - 1 + totalLines) % totalLines : (currentLine + 1) % totalLines;
	}

	function handleArrowKey(e: KeyboardEvent) {
		e.preventDefault();

		const isHorizontal = e.key === 'ArrowLeft' || e.key === 'ArrowRight';
		const newDirection = isHorizontal ? 'Across' : 'Down';

		if (direction !== newDirection) {
			direction = newDirection;
			return;
		}

		let newIndex = selectedCell!;
		const currentCol = selectedCell! % width;

		for (let i = 0; i < totalCells; i++) {
			if (e.key === 'ArrowRight') {
				newIndex = selectToRight(newIndex);
			} else if (e.key === 'ArrowLeft') {
				newIndex = selectToLeft(newIndex);
			} else if (e.key === 'ArrowDown') {
				newIndex += width;
				if (newIndex >= totalCells) {
					newIndex = selectDown(currentCol);
				}
			} else {
				newIndex -= width;
				if (newIndex < 0) {
					newIndex = selectUp(currentCol);
				}
			}

			if (cells[newIndex]?.answer) {
				selectedCell = newIndex;
				return;
			}
		}
	}

	function handleLetterPress(key: string, e: KeyboardEvent) {
		userInput[selectedCell!] = key;

		if (e.shiftKey) {
			return;
		}

		const currentCol = selectedCell! % width;
		let newIndex = selectedCell!;

		for (let i = 0; i < totalCells; i++) {
			if (direction === 'Across') {
				newIndex = selectToRight(newIndex);
			} else {
				newIndex += width;
				if (newIndex >= totalCells) {
					newIndex = selectDown(currentCol);
				}
			}

			if (cells[newIndex]?.answer) {
				selectedCell = newIndex;
				return;
			}
		}
	}

	function handleBackspace() {
		delete userInput[selectedCell!];

		const currentCol = selectedCell! % width;
		let newIndex = selectedCell!;

		for (let i = 0; i < totalCells; i++) {
			if (direction === 'Across') {
				newIndex = selectToLeft(newIndex);
			} else {
				newIndex -= width;
				if (newIndex < 0) {
					newIndex = selectUp(currentCol);
				}
			}

			if (cells[newIndex]?.answer) {
				selectedCell = newIndex;
				return;
			}
		}
	}

	function handleTabPress(e: KeyboardEvent) {
		e.preventDefault();

		const currentRow = Math.floor(selectedCell! / width);
		const currentCol = selectedCell! % width;
		const rowJump = 1;

		if (direction === 'Across') {
			const nextRow = getNextLine(e, currentRow, height);
			const startIndex = nextRow * width;
			const nextCell = findNextAvailableCell(startIndex, rowJump, width);

			if (nextCell !== null) selectedCell = nextCell;
		} else {
			const nextCol = getNextLine(e, currentCol, width);
			const nextCell = findNextAvailableCell(nextCol, width, height);

			if (nextCell !== null) selectedCell = nextCell;
		}
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

		if (e.key === 'Tab') {
			handleTabPress(e);
		}

		const key = e.key.toUpperCase();
		if (key.length === 1 && key >= 'A' && key <= 'Z') {
			handleLetterPress(key, e);
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
			{@const isBlock = !cell.answer}
			{@const isSelected = selectedCell === index}
			{@const isHighlighted =
				index !== selectedCell && cell.answer && shouldHighlightCell(row, col)}
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
