import type { BaseEditor } from "slate";
import type { ReactEditor } from "slate-react";
import { z } from "zod";
import type { ConnectorModels } from "@/lib/connectors/models";
import type { AssetConnectorType } from "@/lib/connectors/types";

export type MediaKind = "image" | "video" | "audio";

/** Text is word timings, with no media of its own. */
export type ResultKind = MediaKind | "text";

/** How an element behaves on the rendered timeline. An overlay is speech: it holds the screen for as long as it talks. */
export type TimelineRole = "foreground" | "background" | "overlay" | "effect";

/** A caption holds no time of its own: it plays over the element it captions. */
export type ElementRole = TimelineRole | "caption";

export type LayerType = "audio" | "visual";

/** The presentation-free facts about a content type. Its look lives in the canvas's `elementConfigs`. */
export type ContentSpec = {
	connector: AssetConnectorType;
	outputKind: ResultKind;
	role: ElementRole;
	layer: LayerType;
	/** Set on a type that generates from the element its plugins depend on, not a prompt: what to do when there is none. */
	source?: string;
	/** Has sound worth putting words to, so a captions element can sit under it. */
	captionable?: true;
};

export const CONTENT_TYPES = {
	narration: {
		connector: "tts",
		outputKind: "audio",
		role: "overlay",
		layer: "audio",
	},
	character: {
		connector: "tts",
		outputKind: "audio",
		role: "overlay",
		layer: "audio",
	},
	image: {
		connector: "image",
		outputKind: "image",
		role: "foreground",
		layer: "visual",
	},
	video: {
		connector: "video",
		outputKind: "video",
		role: "foreground",
		layer: "visual",
		captionable: true,
	},
	sound: {
		connector: "sfx",
		outputKind: "audio",
		role: "effect",
		layer: "audio",
	},
	music: {
		connector: "music",
		outputKind: "audio",
		role: "background",
		layer: "audio",
		captionable: true,
	},
	captions: {
		connector: "transcript",
		outputKind: "text",
		role: "caption",
		layer: "audio",
		source: "Place this right under a video or music element",
	},
} as const satisfies Record<string, ContentSpec>;

export type ContentType = keyof typeof CONTENT_TYPES;

type ContentTypeWhere<K extends "outputKind" | "role", V> = {
	[T in ContentType]: (typeof CONTENT_TYPES)[T][K] extends V ? T : never;
}[ContentType];

/** The types with media of their own, which is what the rendered timeline places. */
export type MediaType = ContentTypeWhere<"outputKind", MediaKind>;

export type ForegroundType = ContentTypeWhere<"role", "foreground">;

export const isMediaType = (type: ContentType): type is MediaType =>
	CONTENT_TYPES[type].outputKind !== "text";

const ALL_CONTENT_TYPES = Object.keys(CONTENT_TYPES) as ContentType[];

export const ContentTypeSchema = z.enum(
	ALL_CONTENT_TYPES as [ContentType, ...ContentType[]],
);

export const DURATION_OPTIONS = Array.from({ length: 12 }, (_, i) =>
	String(i + 4),
);

export const DEFAULT_DURATION = "10";

const DURATIONS = DURATION_OPTIONS.map(Number);

/** The longest a video can be generated at, so the ceiling on what one visual covers. */
export const DURATION_MAX = Math.max(...DURATIONS);

/** The shortest option that still covers `seconds`, or the longest there is. */
export const snapDurationUp = (seconds: number): number =>
	DURATIONS.find((option) => option >= seconds) ?? DURATION_MAX;

export const VOLUME_OPTIONS = [
	"0",
	"1",
	"2",
	"3",
	"4",
	"5",
	"6",
	"7",
	"8",
	"9",
	"10",
] as const;

export const LOOPS_OPTIONS = ["1", "2", "3", "4", "5", "6", "7", "8"] as const;

export const DEFAULT_LOOPS = "1";

export const TOGGLE_ON = "true";
export const TOGGLE_OFF = "false";

export const isToggleOn = (value: string | undefined): boolean =>
	value === TOGGLE_ON;

export const SCENE_TYPE = "scene" as const;

/** What every element type declares: the connector it generates on, if any. */
type ElementSpec = Pick<ContentSpec, "source"> & {
	connector?: AssetConnectorType;
};

/** Tiles ahead of the scenes; one with a connector generates like content does. */
export const ASSET_TYPES = {
	asset_avatar: { connector: "image" },
	asset_voice: { connector: "voice" },
	asset_style: {},
	asset_references: {},
} as const satisfies Record<`asset_${string}`, ElementSpec>;

export type AssetType = keyof typeof ASSET_TYPES;

export type ElementType = ContentType | AssetType;

export const ELEMENT_TYPES: Record<ElementType, ElementSpec> = {
	...CONTENT_TYPES,
	...ASSET_TYPES,
};

type Specs = typeof CONTENT_TYPES & typeof ASSET_TYPES;

export type GeneratedType = {
	[T in ElementType]: Specs[T] extends { connector: AssetConnectorType }
		? T
		: never;
}[ElementType];

/** What a type generates on; metadata generates nothing. */
export function connectorOf(type: GeneratedType): AssetConnectorType;
export function connectorOf(type: ElementType): AssetConnectorType | undefined;
export function connectorOf(type: ElementType) {
	return ELEMENT_TYPES[type].connector;
}

export const isGenerated = (
	element: CanvasElement,
): element is GeneratedElement => connectorOf(element.type) !== undefined;

export const ElementTypeSchema = z.enum(
	Object.keys(ELEMENT_TYPES) as [ElementType, ...ElementType[]],
);

export type CanvasEditor = BaseEditor &
	ReactEditor & {
		id?: string;
		/** Resolved per call, since the project's and account's pins change mid-session. */
		defaultModels: () => ConnectorModels;
	};

export type SplitAttributes = {
	generationAttributes?: Record<string, string>;
	layoutAttributes?: Record<string, string>;
};

export const CHARACTER_REF_TYPE = "character_ref" as const;

export type CharacterRefElement = {
	id: string;
	type: typeof CHARACTER_REF_TYPE;
	name: string;
	children: CanvasText[];
};

export type ElementOf<T extends ElementType> = SplitAttributes & {
	id: string;
	type: T;
	children: (CanvasText | CharacterRefElement)[];
};

export type ContentElement = ElementOf<ContentType>;

export type ForegroundElement = ElementOf<ForegroundType>;

export type AssetElement<T extends AssetType = AssetType> = ElementOf<T>;

export type CanvasElement = ContentElement | AssetElement;

export type GeneratedElement = ElementOf<GeneratedType>;

export type Scene = {
	id: string;
	type: typeof SCENE_TYPE;
	children: ContentElement[];
};

export type CanvasBlock = Scene | CanvasElement;

export type CanvasText = {
	id: string;
	type?: ElementType;
	text: string;
};

declare module "slate" {
	interface CustomTypes {
		Editor: CanvasEditor;
		Element: CanvasBlock | CharacterRefElement;
		Text: CanvasText;
	}
}
