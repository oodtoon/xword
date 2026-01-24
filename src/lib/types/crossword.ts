type DirectionType = 'Across' | 'Down';

type TextType = {
	plain: string;
};

export type CellType = Partial<{
	answer: string;
	clues: number[];
	label: string;
	type: number;
}>;

export type ClueType = {
	cells: number[];
	direction: DirectionType;
	label: string;
	text: TextType[];
};
