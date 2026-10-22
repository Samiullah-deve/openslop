import { describe, expect, it } from "vitest";
import { reviseWords } from "../revise-words";

const words = [
	{ text: "the", start: 0, end: 1 },
	{ text: "quick", start: 1, end: 2 },
	{ text: "fox", start: 2, end: 4 },
	{ text: "ran", start: 4, end: 5 },
];

describe("reviseWords", () => {
	it("keeps the timings of words left as they were", () => {
		expect(reviseWords(words, 0, 4, "the quick box ran")).toEqual([
			words[0],
			words[1],
			{ text: "box", start: 2, end: 4 },
			words[3],
		]);
	});

	it("shares a replaced word's time among the words typed over it, by length", () => {
		expect(reviseWords(words, 0, 4, "the quick brown dog ran")).toEqual([
			words[0],
			words[1],
			{ text: "brown", start: 2, end: 3.25 },
			{ text: "dog", start: 3.25, end: 4 },
			words[3],
		]);
	});

	it("gives a word added between kept ones a share of the word before it", () => {
		expect(reviseWords(words, 0, 2, "the very quick")).toEqual([
			{ text: "the", start: 0, end: 3 / 7 },
			{ text: "very", start: 3 / 7, end: 1 },
			words[1],
			words[2],
			words[3],
		]);
	});

	it("drops the words deleted from the line", () => {
		expect(reviseWords(words, 0, 4, "the fox ran")).toEqual([
			words[0],
			words[2],
			words[3],
		]);
	});

	it("touches only the line it is given", () => {
		expect(reviseWords(words, 2, 4, "dog ran")).toEqual([
			words[0],
			words[1],
			{ text: "dog", start: 2, end: 4 },
			words[3],
		]);
	});

	it("leaves the words alone when the text is unchanged", () => {
		expect(reviseWords(words, 0, 4, "  the quick  fox ran ")).toEqual(words);
	});
});
