"use client";

import { Path } from "slate";
import { ReactEditor, useSlateStatic } from "slate-react";
import { Button } from "@/components/ui/button";
import { Captions } from "@/components/ui/icon";
import { insertElement } from "@/lib/canvas/insert-element";
import type { ContentElement } from "@/lib/canvas/types";
import { useGenerationQueue } from "@/lib/generation/generation-queue-provider";
import { buildNode, generatedById } from "@/lib/generation/generation-graph";
import { useBuildContext } from "@/lib/generation/use-build-context";
import { useElementGeneration } from "./element-generation-context";

export function CaptionButton({ element }: { element: ContentElement }) {
	const editor = useSlateStatic();
	const queue = useGenerationQueue();
	const buildContext = useBuildContext();
	const { result } = useElementGeneration();

	return (
		<Button
			type="button"
			variant="ghost"
			size="sm"
			tooltip={
				result
					? "Add captions of what is said or sung here"
					: "Generate this element first"
			}
			className="shrink-0"
			disabled={!result}
			onMouseDown={(e) => e.preventDefault()}
			onClick={() => {
				const at = Path.next(ReactEditor.findPath(editor, element));
				const id = insertElement(editor, "captions", at);
				const ctx = buildContext();
				const captions = generatedById(ctx.canvas, id);
				if (!captions) throw new Error(`Captions "${id}" were not inserted`);
				queue.enqueueGraph([buildNode(captions, ctx)]);
			}}
		>
			<Captions aria-hidden="true" />
			<span className="hidden @sm:inline">Caption</span>
		</Button>
	);
}
