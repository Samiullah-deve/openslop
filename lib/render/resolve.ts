import {
	CONTENT_TYPES,
	isMediaType,
	type CanvasBlock,
} from "@/lib/canvas/types";
import { isCaptionable } from "@/lib/canvas/guards";
import { getContentElements, isScene } from "@/lib/canvas/scenes";
import { getPromptText } from "@/lib/generation/inputs";
import { getPrimaryUrl } from "@/lib/connectors/asset-url";
import type { ElementSnapshot } from "@/lib/generation/snapshots";
import type { ResolvedCaptions, ResolvedElement } from "./types";
import {
	getLoop,
	getLoops,
	getMotion,
	getVolume,
} from "../canvas/element-attributes";
import { elementTrim, trimTimestamps } from "./clip-trim";

type GetSnapshot = (id: string) => ElementSnapshot;

/** Each captioned element's id, to the captions element right under it. */
function captionsUnder(blocks: CanvasBlock[]): Map<string, string> {
	const content = getContentElements(blocks);
	return new Map(
		content.flatMap((element, at) => {
			const above = content[at - 1];
			return CONTENT_TYPES[element.type].role === "caption" &&
				isCaptionable(above)
				? [[above.id, element.id] as const]
				: [];
		}),
	);
}

function resolveCaptions(
	ownerId: string,
	getSnapshot: GetSnapshot,
	trimStartSec: number,
): ResolvedCaptions | undefined {
	const timestamps = getSnapshot(ownerId).result?.textTimestamps;
	if (!timestamps?.length) return undefined;
	const words = trimTimestamps(timestamps, trimStartSec);
	return { ownerId, firstWord: timestamps.length - words.length, words };
}

export function resolveElements(
	blocks: CanvasBlock[],
	getSnapshot: GetSnapshot,
	{ captionsEnabled }: { captionsEnabled: boolean },
): ResolvedElement[] {
	const resolved: ResolvedElement[] = [];
	const captionsByElement = captionsUnder(blocks);
	let sceneNumber = 0;

	for (const scene of blocks) {
		if (!isScene(scene)) continue;
		sceneNumber += 1;

		for (const element of scene.children) {
			const snapshot = getSnapshot(element.id);
			if (!snapshot.result || !isMediaType(element.type)) continue;

			const spec = CONTENT_TYPES[element.type];
			const url = getPrimaryUrl(snapshot.result, spec.outputKind);
			if (!url) continue;

			const mediaDurationSec = snapshot.result.durationSec;
			const trim = elementTrim(element, mediaDurationSec);
			const ownerId = snapshot.result.textTimestamps
				? element.id
				: captionsByElement.get(element.id);

			resolved.push({
				id: element.id,
				type: element.type,
				role: spec.role,
				layer: spec.layer,
				sceneId: scene.id,
				sceneNumber,
				prompt: getPromptText(element),
				url,
				...trim,
				mediaDurationSec,
				loops: getLoops(element),
				loop: getLoop(element),
				volume: getVolume(element),
				motion: getMotion(element),
				captions:
					captionsEnabled && ownerId
						? resolveCaptions(ownerId, getSnapshot, trim.trimStartSec)
						: undefined,
			});
		}
	}

	return resolved;
}
