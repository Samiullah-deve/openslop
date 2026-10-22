"use client";

import { useElementGeneration } from "../element-generation-context";
import { PreviewChrome, ResultOverlay } from "./overlays";
import { AudioPlaceholder } from "./results";
import type { ElementPreviewProps } from "./status";

function PreviewNote({ children }: { children: string }) {
	return (
		<div className="flex min-h-16 w-full items-center rounded-lg border border-border bg-muted px-3 py-2 text-label text-muted-foreground">
			{children}
		</div>
	);
}

export function TranscriptPreview({
	result,
	topRight,
	...state
}: ElementPreviewProps) {
	const { missingInput } = useElementGeneration();
	const words = result?.textTimestamps;

	if (missingInput) return <PreviewNote>{missingInput}</PreviewNote>;
	if (!words) return <AudioPlaceholder topRight={topRight} {...state} />;

	return (
		<div className="group relative flex max-h-48 w-full flex-col overflow-y-auto rounded-lg border border-border bg-element-card px-2.5 py-2 text-label leading-relaxed">
			<ResultOverlay status={state.status} startedAt={state.startedAt} />
			<PreviewChrome topRight={topRight} />
			<p>
				{words.length > 0
					? words.map((word) => word.text).join(" ")
					: "No words were heard"}
			</p>
		</div>
	);
}
