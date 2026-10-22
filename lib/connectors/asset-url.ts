import compact from "lodash/compact";
import type { MediaKind } from "@/lib/canvas/types";
import type { AssetResult } from "./types";

const ASSET_KIND_URL_FIELD = {
	image: "imageUrl",
	audio: "audioUrl",
	video: "videoUrl",
} as const satisfies Record<MediaKind, keyof AssetResult>;

export const ASSET_URL_FIELDS = Object.values(ASSET_KIND_URL_FIELD);

const IDENTITY_FIELDS = [...ASSET_URL_FIELDS, "voiceId"] as const;

export const resultIdentity = (result: AssetResult): string =>
	compact(IDENTITY_FIELDS.map((field) => result[field])).join("|");

export function assetUrlField(kind: MediaKind) {
	return ASSET_KIND_URL_FIELD[kind];
}

export function getPrimaryUrl(
	result: AssetResult | null | undefined,
	kind: MediaKind,
): string | undefined {
	return result?.[assetUrlField(kind)];
}
