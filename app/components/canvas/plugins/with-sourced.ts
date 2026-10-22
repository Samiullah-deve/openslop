import { isSourced } from "@/lib/canvas/guards";
import type { CanvasEditor } from "@/lib/canvas/types";

/** An element with no prompt is a void, so the caret never lands in text nobody sees. */
export const withSourced = (editor: CanvasEditor): CanvasEditor => {
	const { isVoid } = editor;
	editor.isVoid = (element) => isSourced(element) || isVoid(element);
	return editor;
};
