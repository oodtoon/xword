import type { CellType, DirectionType } from '$lib/types/crossword';

export function getNextLine(e: KeyboardEvent, currentLine: number, totalLines: number) {
	const reverse = e.shiftKey;
	return reverse ? (currentLine - 1 + totalLines) % totalLines : (currentLine + 1) % totalLines;
}

export function findNextAvailableCell(
	cells: CellType[],
	startIndex: number,
	step: number,
	limit: number
): number | null {
	for (let i = 0; i < limit; i++) {
		const checkIndex = startIndex + i * step;
		if (cells[checkIndex]?.answer) {
			return checkIndex;
		}
	}
	return null;
}

export function selectToRight(newIndex: number, totalCells: number) {
	return (newIndex + 1) % totalCells;
}

export function selectToLeft(newIndex: number, totalCells: number) {
	return (newIndex - 1 + totalCells) % totalCells;
}

export function selectDown(currentCol: number, width: number) {
	return (currentCol + 1) % width;
}

export function selectUp(currentCol: number, width: number, height: number) {
	return (height - 1) * width + ((currentCol - 1 + width) % width);
}

export function getNextCell(
	currentIndex: number,
	direction: DirectionType,
	totalCells: number,
	width: number,
	cells: CellType[]
): number | null {
	let nextIndex = currentIndex;

	if (direction === 'Across') {
		nextIndex = currentIndex + 1;
		if (nextIndex % width === 0 || nextIndex >= totalCells) {
			return null;
		}
	} else {
		nextIndex = currentIndex + width;
		if (nextIndex >= totalCells) {
			return null;
		}
	}

	// Skip black squares
	if (!cells[nextIndex]?.answer) {
		return getNextCell(nextIndex, direction, totalCells, width, cells);
	}

	return nextIndex;
}
