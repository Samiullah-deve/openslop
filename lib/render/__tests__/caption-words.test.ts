import { describe, expect, it } from "vitest";
import { captionWordFrames } from "../caption-words";
import type { RenderLayout, ResolvedCaptions, Sequence } from "../types";

const captioned = (start: number, captions: ResolvedCaptions): Sequence =>
	({ start, duration: 5, element: { id: "vid", captions } }) as Sequence;

const layout = (sequences: Sequence[]) =>
	({ series: sequences, sequences: {}, fps: 10 }) as unknown as RenderLayout;

const captions: ResolvedCaptions = {
	ownerId: "cap",
	firstWord: 1,
	words: [{ text: "two", start: 0.5, end: 1 }],
};

describe("captionWordFrames", () => {
	it("is where the clip starts plus each word's own time, by the owner's word index", () => {
		expect(captionWordFrames(layout([captioned(2, captions)]), "cap")).toEqual(
			new Map([[1, 25]]),
		);
	});

	it("has nothing for words no clip plays", () => {
		expect(
			captionWordFrames(layout([captioned(2, captions)]), "other").size,
		).toBe(0);
	});
});
