import { writable, type Writable } from 'svelte/store';

export type Direction = 'across' | 'down';

export interface Cell {
	isBlock: boolean;
	number: number | null;
	letter: string;
	solution: string;
}

export interface Clue {
	direction: Direction;
	number: number;
	clue: string;
}

export interface Clues {
	across: Clue[];
	down: Clue[];
}

export interface CrosswordState {
	rows: number;
	cols: number;
	grid: Cell[][];
	clues: Clues;
	stage: number;
}

function createGrid(rows: number, cols: number): Cell[][] {
	return Array.from({ length: rows }, () =>
		Array.from({ length: cols }, () => ({
			isBlock: false,
			number: null,
			letter: '',
			solution: ''
		}))
	);
}

export const crossword: Writable<CrosswordState> = writable({
	rows: 5,
	cols: 5,
	grid: createGrid(5, 5),
	clues: {
		across: [],
		down: []
	},
	stage: 1
});

// Helper to initialize a new blank grid

export function initGrid(rows = 5, cols = 5): void {
	const grid = createGrid(rows, cols);
	crossword.update((c) => ({ ...c, rows, cols, grid }));
}
