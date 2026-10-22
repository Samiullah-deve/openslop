import type { AssetResult, TextTimestamp } from "@/lib/connectors/types";

const sharedPrefix = (a: readonly string[], b: readonly string[]): number => {
	let length = 0;
	while (length < a.length && length < b.length && a[length] === b[length])
		length += 1;
	return length;
};

/** Lays `texts` end to end over `span`, each taking time in proportion to its length. */
function spread(
	texts: readonly string[],
	{ start, end }: Pick<TextTimestamp, "start" | "end">,
): TextTimestamp[] {
	const total = texts.reduce((sum, text) => sum + text.length, 0);
	let at = start;
	return texts.map((text) => {
		const word = {
			text,
			start: at,
			end: at + ((end - start) * text.length) / total,
		};
		at = word.end;
		return word;
	});
}

/**
 * The typed text becomes one caption line, however many words it has. Kept
 * words keep their timings; changed ones share the time of those they replace,
 * and an added one shares the word before it.
 */
export function reviseWords(
	words: readonly TextTimestamp[],
	from: number,
	to: number,
	text: string,
): TextTimestamp[] {
	const before = words.slice(from, to).map((word) => word.text);
	const after = text.split(/\s+/).filter(Boolean);
	let head = sharedPrefix(before, after);
	let tail = sharedPrefix(
		before.slice(head).reverse(),
		after.slice(head).reverse(),
	);
	if (head + tail === before.length && after.length > before.length) {
		if (head > 0) head -= 1;
		else tail -= 1;
	}
	const replaced = words.slice(from + head, to - tail);
	const added = after.slice(head, after.length - tail);
	const first = replaced.at(0);
	const last = replaced.at(-1);
	const retimed =
		first && last && added.length > 0
			? spread(added, { start: first.start, end: last.end })
			: [];
	const line = words[from]?.line ?? words[from]?.start;
	return [
		...words.slice(0, from + head),
		...retimed,
		...words.slice(to - tail),
	].map((word, at) =>
		at >= from && at < from + after.length ? { ...word, line } : word,
	);
}

export function reviseCaptions(
	result: AssetResult,
	from: number,
	to: number,
	text: string,
): AssetResult {
	if (!result.textTimestamps) throw new Error("This result has no captions");
	return {
		...result,
		textTimestamps: reviseWords(result.textTimestamps, from, to, text),
	};
}
