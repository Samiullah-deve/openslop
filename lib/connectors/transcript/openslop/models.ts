import { CARTESIA_TRANSCRIPT_MODELS } from "../cartesia/models";
import { ELEVENLABS_TRANSCRIPT_MODELS } from "../elevenlabs/models";

export const OPENSLOP_TRANSCRIPT_MODELS = {
	"Slop Transcript v1": ELEVENLABS_TRANSCRIPT_MODELS["Scribe v2"],
	"Slop Transcript v1 Fast": CARTESIA_TRANSCRIPT_MODELS["Ink Whisper"],
} as const;
