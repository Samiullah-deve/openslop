import sortedLastIndex from "lodash/sortedLastIndex";
import type { CaptionReveal } from "./caption-style";

export type CaptionWord = {
	text: string;
	active: boolean;
	/** Not yet spoken under `word` reveal; it holds its space but stays unseen. */
	hidden: boolean;
};

/** Index of the word being spoken at `seconds`, or -1 before the first one. */
export function activeWordIndex(startTimes: number[], seconds: number): number {
	return sortedLastIndex(startTimes, seconds) - 1;
}

/** A typed line (shared line id) stays whole; other words run `maxWordsPerLine` to a line from the last typed one. */
export function captionLineAt(
	wordCount: number,
	wordIndex: number,
	maxWordsPerLine: number,
	lineIds: readonly (number | undefined)[] = [],
): { start: number; end: number } {
	if (wordIndex < 0 || wordIndex >= wordCount) return { start: 0, end: 0 };
	const id = lineIds[wordIndex];
	const sameLine = (at: number) => lineIds[at] === id;
	let start = wordIndex;
	while (start > 0 && sameLine(start - 1)) start -= 1;
	if (id === undefined) {
		const perLine = Math.max(1, Math.floor(maxWordsPerLine));
		start += Math.floor((wordIndex - start) / perLine) * perLine;
		let end = start;
		while (end < wordCount && end < start + perLine && sameLine(end)) end += 1;
		return { start, end };
	}
	let end = wordIndex + 1;
	while (end < wordCount && sameLine(end)) end += 1;
	return { start, end };
}

/**
 * The words on the line `wordIndex` sits on. The whole line is always returned
 * so its footprint never shifts mid-reveal.
 */
export function captionWordsAt(
	words: readonly string[],
	wordIndex: number,
	{
		maxWordsPerLine,
		reveal,
	}: { maxWordsPerLine: number; reveal: CaptionReveal },
	lineIds: readonly (number | undefined)[] = [],
): CaptionWord[] {
	if (wordIndex < 0 || wordIndex >= words.length) return [];

	const { start, end } = captionLineAt(
		words.length,
		wordIndex,
		maxWordsPerLine,
		lineIds,
	);
	const activeInLine = wordIndex - start;

	return words.slice(start, end).map((text, index) => ({
		text,
		active: index === activeInLine,
		hidden: reveal === "word" && index > activeInLine,
	}));
}
