<script lang="ts">
	import ClueList from '$lib/components/ClueList.svelte';
	import CrosswordGrid from '$lib/components/CrosswordGrid.svelte';
	import { type ClueType, type CellType, type DirectionType } from '$lib/types/crossword';
	let { data } = $props();

	const { cells, dimensions, clues } = data.game.body['0'];
	const { width, height } = dimensions;
	const totalCells = width * height;

	let selectedCell = $state<number>(clues[0].cells[0]);
	let userInput = $state<Record<number, string>>({});
	let direction = $state<DirectionType>('Across');
	let checkedState = $state<Record<number, boolean> | null>(null);
	let currentClue = $derived.by(() => {
		return clues.find(
			(clue: ClueType) => clue.direction === direction && clue.cells.includes(selectedCell)
		);
	});
	let altClue = $derived.by(() => {
		return clues.find(
			(clue: ClueType) => clue.direction !== direction && clue.cells.includes(selectedCell)
		);
	});

	function handleCellClick(index: number, cell: CellType) {
		if (cell.answer) {
			selectedCell = index;
		}
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
		clearIncorrectCellCheck(selectedCell!)

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
		if (!checkedState?.[selectedCell!]) {
			delete userInput[selectedCell!];
		}


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

	function checkPuzzle() {
		const results: Record<number, boolean> = {};

		for (const index in userInput) {
			const i = Number(index);
			const input = userInput[i];
			const answer = cells[i]?.answer;

			if (!input || !answer) continue;

			results[i] = input === answer;
		}

		checkedState = results;
	}

	function clearIncorrectCellCheck(index: number) {
		if (checkedState && checkedState[index] === false) {
			const newCheckedState = { ...checkedState };
			delete newCheckedState[index];
			checkedState = newCheckedState;
		}
	}

	$effect(() => {
		window.addEventListener('keydown', handleKeyPress);
		return () => window.removeEventListener('keydown', handleKeyPress);
	});
</script>

<div class="flex justify-center gap-10 p-10">
	<div class="flex w-xl flex-col items-center gap-4">
		<div class="highlighted-clue mx-auto w-full max-w-md rounded px-6 py-2">
			<h3 class="font-semibold">{direction}</h3>
			{currentClue.text[0].plain}
		</div>
		<CrosswordGrid
			{cells}
			{width}
			{height}
			{direction}
			{selectedCell}
			{userInput}
			{checkedState}
			{handleCellClick}
		/>
	</div>

	<div class="flex flex-col">
		<button onclick={checkPuzzle} class="check-puzzle-btn ml-auto cursor-pointer rounded p-2"
			>Check Puzzle</button
		>
		<div class="flex flex-col gap-10">
			<ClueList {clues} {currentClue} {altClue} clueDirection={'Across'} />
			<ClueList {clues} {currentClue} {altClue} clueDirection={'Down'} />
		</div>
	</div>
</div>
