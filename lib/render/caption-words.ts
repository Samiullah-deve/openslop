import { toFrames } from "./frames";
import type { RenderLayout } from "./types";

/** The frame each of the owner's words is heard at, by its index; none for words no clip plays. */
export function captionWordFrames(
	{ series, sequences, fps }: RenderLayout,
	ownerId: string,
): Map<number, number> {
	const clip = [...series, ...Object.values(sequences).flat()].find(
		({ element }) => element.captions?.ownerId === ownerId,
	);
	const captions = clip?.element.captions;
	if (!clip || !captions) return new Map();
	return new Map(
		captions.words.map((word, at) => [
			captions.firstWord + at,
			toFrames(clip.start + word.start, fps),
		]),
	);
}
