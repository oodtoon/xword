import type { CellType, ClueType, DirectionType, GameDataType } from '$lib/types/crossword';
import * as utils from '$lib/utils/crossword';

export class MiniCrossword {
	cells: CellType[] = [];
	clues: ClueType[] = [];
	width: number = 5;
	height: number = 5;
	totalCells: number = 25;
	direction = $state<DirectionType>('Across');
	selectedCellIndex = $state<number>(0);
	isWin = $state<boolean>(false);

	userInput = $state<Record<number, string>>({});
	checkedState = $state<Record<number, boolean> | null>(null);

	currentClue = $derived<ClueType>(
		this.clues.find(
			(clue: ClueType) =>
				clue.direction === this.direction && clue.cells.includes(this.selectedCellIndex)
		)!
	);

	altClue = $derived<ClueType>(
		this.clues.find(
			(clue: ClueType) =>
				clue.direction !== this.direction && clue.cells.includes(this.selectedCellIndex)
		)!
	);

	highlightedCells = $derived<number[]>(this.currentClue.cells);

	constructor(game: GameDataType) {
		this.cells = game.cells;
		this.clues = game.clues;
		this.width = game.dimensions.width;
		this.height = game.dimensions.height;
		this.selectedCellIndex = game.clues[0].cells[0];
		this.totalCells = this.width * this.height;
	}

	handleCellClick = (index: number, cell: CellType) => {
		if (!cell.answer) return;

		if (this.selectedCellIndex === index) {
			this.direction = this.direction === 'Across' ? 'Down' : 'Across';
		} else {
			this.selectedCellIndex = index;
		}
	};

	handleArrowKey = (e: KeyboardEvent) => {
		e.preventDefault();

		const isHorizontal = e.key === 'ArrowLeft' || e.key === 'ArrowRight';
		const newDirection = isHorizontal ? 'Across' : 'Down';

		if (this.direction !== newDirection) {
			this.direction = newDirection;
			return;
		}

		let newIndex = this.selectedCellIndex!;
		const currentCol = this.selectedCellIndex! % this.width;

		for (let i = 0; i < this.totalCells; i++) {
			if (e.key === 'ArrowRight') {
				newIndex = utils.selectToRight(newIndex, this.totalCells);
			} else if (e.key === 'ArrowLeft') {
				newIndex = utils.selectToLeft(newIndex, this.totalCells);
			} else if (e.key === 'ArrowDown') {
				newIndex += this.width;
				if (newIndex >= this.totalCells) {
					newIndex = utils.selectDown(currentCol, this.width);
				}
			} else {
				newIndex -= this.width;
				if (newIndex < 0) {
					newIndex = utils.selectUp(currentCol, this.width, this.height);
				}
			}

			if (this.cells[newIndex]?.answer) {
				this.selectedCellIndex = newIndex;
				return;
			}
		}
	};

	handleLetterPress = (key: string, e: KeyboardEvent) => {
		this.userInput[this.selectedCellIndex] = key;
		this.clearIncorrectCellCheck(this.selectedCellIndex);

		if (e.shiftKey) {
			return;
		}

		const currentCol = this.selectedCellIndex % this.width;
		let newIndex = this.selectedCellIndex;

		for (let i = 0; i < this.totalCells; i++) {
			if (this.direction === 'Across') {
				newIndex = utils.selectToRight(newIndex, this.totalCells);
			} else {
				newIndex += this.width;
				if (newIndex >= this.totalCells) {
					newIndex = utils.selectDown(currentCol, this.width);
				}
			}

			if (this.cells[newIndex]?.answer) {
				this.selectedCellIndex = newIndex;
				return;
			}
		}
	};
	
	handleTabPress = (e: KeyboardEvent) => {
		e.preventDefault();
		const totalClues = this.clues.length;
		const currentClueIndex = this.clues.findIndex((clue) => clue === this.currentClue);
		const tabDirection = e.shiftKey ? -1 : 1;
		
		const nextClueIndex = (currentClueIndex + tabDirection + totalClues) % totalClues;
		
		const nextClue = this.clues[nextClueIndex];
		
		this.selectedCellIndex = this.getEarliestBlankIndex(nextClue.cells) || nextClue.cells[0];
		this.direction = nextClue.direction;
	};
	
	handleBackspace = () => {
		if (!this.checkedState?.[this.selectedCellIndex]) {
			delete this.userInput[this.selectedCellIndex];
		}
		
		const currentCol = this.selectedCellIndex % this.width;
		let newIndex = this.selectedCellIndex;
		
		for (let i = 0; i < this.totalCells; i++) {
			if (this.direction === 'Across') {
				newIndex = utils.selectToLeft(newIndex, this.totalCells);
			} else {
				newIndex -= this.width;
				if (newIndex < 0) {
					newIndex = utils.selectUp(currentCol, this.width, this.height);
				}
			}
			
			if (this.cells[newIndex]?.answer) {
				this.selectedCellIndex = newIndex;
				return;
			}
		}
	};
	
	handleKeyPress = (e: KeyboardEvent) => {
		if (this.selectedCellIndex === null) return;
		
		if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
			this.handleArrowKey(e);
			return;
		}
		
		if (e.key === 'Backspace') {
			this.handleBackspace();
			return;
		}
		
		if (e.key === 'Tab') {
			this.handleTabPress(e);
		}
		
		const key = e.key.toUpperCase();
		if (key.length === 1 && key >= 'A' && key <= 'Z') {
			this.handleLetterPress(key, e);
			if (this.isWinState()) {
				this.isWin = true;
			}
		}
	};
	
	clearIncorrectCellCheck = (index: number) => {
		if (this.checkedState && this.checkedState[index] === false) {
			const newCheckedState = { ...this.checkedState };
			delete newCheckedState[index];
			this.checkedState = newCheckedState;
		}
	};
	
	highlightRelative = (index: number): boolean => {
		return (
			this.currentClue?.relatives?.some(
				(relativeIndex: number) =>
					this.clues[relativeIndex].cells.includes(index) && index !== this.selectedCellIndex
			) ?? false
		);
	};
	
	getEarliestBlankIndex(indexes: number[]) {
		return indexes.find((index) => !this.userInput[index])
	}

	checkPuzzle = () => {
		const results: Record<number, boolean> = {};

		for (const index in this.userInput) {
			const i = Number(index);
			const input = this.userInput[i];
			const answer = this.cells[i]?.answer;

			if (!input || !answer) continue;

			results[i] = input === answer;
		}

		this.checkedState = results;
	};

	isWinState = () => {
		return this.cells.every((cell, index) => {
			return cell?.answer === this.userInput[index];
		});
	};

	reset() {
		this.userInput = {};
		this.checkedState = null;
		this.selectedCellIndex = 0;
		this.isWin = false;
	}
}
