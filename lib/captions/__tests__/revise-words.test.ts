import { describe, expect, it } from "vitest";
import type { TextTimestamp } from "@/lib/connectors/types";
import { captionWordsAt } from "../caption-layout";
import { reviseWords } from "../revise-words";

const words = [
	{ text: "the", start: 0, end: 1 },
	{ text: "quick", start: 1, end: 2 },
	{ text: "fox", start: 2, end: 4 },
	{ text: "ran", start: 4, end: 5 },
];

/** The words of a line typed at 0s carry that line's id. */
const typed = (...line: TextTimestamp[]) =>
	line.map((word) => ({ ...word, line: 0 }));

describe("reviseWords", () => {
	it("keeps the timings of words left as they were", () => {
		expect(reviseWords(words, 0, 4, "the quick box ran")).toEqual(
			typed(words[0], words[1], { text: "box", start: 2, end: 4 }, words[3]),
		);
	});

	it("shares a replaced word's time among the words typed over it, by length", () => {
		expect(reviseWords(words, 0, 4, "the quick brown dog ran")).toEqual(
			typed(
				words[0],
				words[1],
				{ text: "brown", start: 2, end: 3.25 },
				{ text: "dog", start: 3.25, end: 4 },
				words[3],
			),
		);
	});

	it("gives a word added between kept ones a share of the word before it", () => {
		expect(reviseWords(words, 0, 2, "the very quick")).toEqual([
			...typed(
				{ text: "the", start: 0, end: 3 / 7 },
				{ text: "very", start: 3 / 7, end: 1 },
				words[1],
			),
			words[2],
			words[3],
		]);
	});

	it("drops the words deleted from the line", () => {
		expect(reviseWords(words, 0, 4, "the fox ran")).toEqual(
			typed(words[0], words[2], words[3]),
		);
	});

	it("touches only the line it is given, and names that line by when it starts", () => {
		expect(reviseWords(words, 2, 4, "dog ran")).toEqual([
			words[0],
			words[1],
			{ text: "dog", start: 2, end: 4, line: 2 },
			{ ...words[3], line: 2 },
		]);
	});

	it("keeps a line's id when it is edited again", () => {
		const once = reviseWords(words, 2, 4, "dog ran");
		expect(reviseWords(once, 2, 4, "dog ran off").map((w) => w.line)).toEqual([
			undefined,
			undefined,
			2,
			2,
			2,
		]);
	});
});

describe("a typed line on screen", () => {
	const song = ["the", "quick", "fox", "ran", "over", "the", "lazy", "dog"].map(
		(text, at) => ({ text, start: at, end: at + 1 }),
	);
	const lineOf = (timestamps: TextTimestamp[], at: number) =>
		captionWordsAt(
			timestamps.map((word) => word.text),
			at,
			{ maxWordsPerLine: 4, reveal: "line" },
			timestamps.map((word) => word.line),
		).map((word) => word.text);

	it("shows every word typed, and leaves the lines after it as they were", () => {
		const edited = reviseWords(song, 0, 4, "the quick brown fox ran");
		expect(lineOf(edited, 0)).toEqual(["the", "quick", "brown", "fox", "ran"]);
		expect(lineOf(edited, 5)).toEqual(["over", "the", "lazy", "dog"]);
	});

	it("pulls nothing up from the next line when words are deleted", () => {
		const edited = reviseWords(song, 0, 4, "the fox");
		expect(lineOf(edited, 0)).toEqual(["the", "fox"]);
		expect(lineOf(edited, 2)).toEqual(["over", "the", "lazy", "dog"]);
	});
});
