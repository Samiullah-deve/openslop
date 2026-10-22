"use client";

import { isContentType } from "@/lib/canvas/guards";
import { ELEMENT_CONFIGS } from "../element-configs";
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

/** Names the element above that these captions transcribe. */
function CaptionedLabel() {
	const { node } = useElementGeneration();
	const [captioned] = Object.values(node.dependsOn);
	const type = captioned?.job.elementType;
	if (!type || !isContentType(type)) return null;
	const { Icon, label, colorClass } = ELEMENT_CONFIGS[type];
	return (
		<p className="flex items-center gap-1 text-label-xs text-muted-foreground">
			<Icon size={14} className={colorClass} aria-hidden="true" />
			Captions the {label.toLowerCase()} above
		</p>
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
		<div className="group relative flex max-h-48 w-full flex-col gap-1.5 overflow-y-auto rounded-lg border border-border bg-element-card px-2.5 py-2 text-label leading-relaxed">
			<ResultOverlay status={state.status} startedAt={state.startedAt} />
			<PreviewChrome topRight={topRight} />
			<CaptionedLabel />
			<p>
				{words.length > 0
					? words.map((word) => word.text).join(" ")
					: "No words were heard"}
			</p>
			<p className="text-label-xs text-muted-foreground">
				Pause the player and click a caption to edit it
			</p>
		</div>
	);
}
