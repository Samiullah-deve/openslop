"use client";

import { useMemo } from "react";
import { usePlayerPlacement } from "@/app/components/player/player-placement-context";
import { useLayout } from "@/app/components/player/render-layout-context";
import { usePlayerScrub } from "@/app/components/player/use-player-scrub";
import type { TextTimestamp } from "@/lib/connectors/types";
import { captionWordFrames } from "@/lib/render/caption-words";
import { useElementGeneration } from "../element-generation-context";
import { AudioPlaceholder } from "./results";
import { PreviewChrome, ResultOverlay } from "./overlays";
import type { ElementPreviewProps } from "./status";

function PreviewNote({ children }: { children: string }) {
	return (
		<div className="flex min-h-16 w-full items-center rounded-lg border border-border bg-muted px-3 py-2 text-label text-muted-foreground">
			{children}
		</div>
	);
}

/** Each word pauses the player on itself, where its line can be edited. */
function TranscriptWords({
	ownerId,
	words,
}: {
	ownerId: string;
	words: TextTimestamp[];
}) {
	const { layout } = useLayout();
	const frames = useMemo(
		() => captionWordFrames(layout, ownerId),
		[layout, ownerId],
	);
	const scrub = usePlayerScrub();
	const { showPlayer } = usePlayerPlacement();

	return words.map((word, index) => {
		const frame = frames.get(index);
		return (
			<button
				// Words repeat, so the position is the identity.
				key={index}
				type="button"
				className="rounded-xs px-0.5 hover:bg-muted focus-visible:bg-muted disabled:text-muted-foreground disabled:hover:bg-transparent"
				disabled={frame === undefined}
				onMouseDown={(e) => e.preventDefault()}
				onClick={() => {
					if (frame === undefined) return;
					showPlayer();
					scrub.start();
					scrub.seekTo(frame);
				}}
			>
				{word.text}
			</button>
		);
	});
}

export function TranscriptPreview({
	result,
	topRight,
	...state
}: ElementPreviewProps) {
	const { node, missingInput } = useElementGeneration();
	const words = result?.textTimestamps;

	if (missingInput) return <PreviewNote>{missingInput}</PreviewNote>;
	if (!words) return <AudioPlaceholder topRight={topRight} {...state} />;
	if (words.length === 0) return <PreviewNote>No words were heard</PreviewNote>;

	return (
		<div className="group relative max-h-40 w-full overflow-y-auto rounded-lg border border-border bg-element-card px-2.5 py-2 text-label leading-relaxed">
			<ResultOverlay status={state.status} startedAt={state.startedAt} />
			<PreviewChrome topRight={topRight} />
			<p className="flex flex-wrap gap-x-0.5">
				<TranscriptWords ownerId={node.id} words={words} />
			</p>
		</div>
	);
}
