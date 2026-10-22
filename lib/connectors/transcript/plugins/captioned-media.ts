import { captionedElement } from "@/lib/canvas/scenes";
import type {
	ConnectorPlugin,
	TranscriptGenerateParams,
} from "@/lib/connectors/types";
import type { Dependency } from "@/lib/generation/declare";

const CAPTIONED_LABEL = "the captioned media";

const captioned: Dependency = ({ id }, { canvas }) => ({
	[CAPTIONED_LABEL]: captionedElement(canvas, id),
});

/** Transcribes the element right above, so its captions go stale when it changes. */
export function createCaptionedMediaPlugin(): ConnectorPlugin<TranscriptGenerateParams> {
	return {
		name: "captioned-media",
		dependencies: [captioned],
		beforeGenerate(params, ctx) {
			const source = ctx.dependencies?.[CAPTIONED_LABEL];
			const mediaUrl = source?.videoUrl ?? source?.audioUrl;
			if (!mediaUrl)
				throw new Error("The element above has no sound to caption");
			return { ...params, mediaUrl };
		},
	};
}
