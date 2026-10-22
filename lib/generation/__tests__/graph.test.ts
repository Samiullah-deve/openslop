import { describe, expect, it } from "vitest";
import { flattenGraph, missingInput } from "../graph";
import { jobNode as node } from "./_graph";

describe("flattenGraph", () => {
	it("orders dependencies before dependents and visits shared nodes once", () => {
		const shared = node("shared");
		const left = node("left", [shared]);
		const right = node("right", [shared]);

		expect(flattenGraph([left, right]).map((n) => n.id)).toEqual([
			"shared",
			"left",
			"right",
		]);
	});
});

describe("missingInput", () => {
	const captions = (dependsOn = node("vid").dependsOn) => ({
		...node("cap", [], { prompt: "" }),
		dependsOn,
		job: { ...node("cap").job, elementType: "captions" as const },
	});

	it("asks for a prompt", () => {
		expect(missingInput(node("a", [], { prompt: "" }))).toBe(
			"Enter a prompt first",
		);
		expect(missingInput(node("a"))).toBeUndefined();
	});

	it("asks a type that generates from another element for that element, not a prompt", () => {
		expect(missingInput(captions())).toMatch(/under a video or music/);
		expect(missingInput(captions({ media: node("vid") }))).toBeUndefined();
	});
});
