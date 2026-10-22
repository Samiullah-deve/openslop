import isEmpty from "lodash/isEmpty";
import pick from "lodash/pick";
import {
	ELEMENT_TYPES,
	type ElementType,
	type CanvasElement,
} from "@/lib/canvas/types";
import type { ConnectorRegistry } from "@/lib/connectors/registry";
import type {
	AssetConnectorType,
	ConnectorConfig,
	ModelRef,
} from "@/lib/connectors/types";
import type { ProjectData } from "@/lib/project/store";
import type { NodeInputs } from "./inputs";

export type NodeId = string;

/** How a node runs: the connector and its configuration. */
export type GenerationJob = {
	elementType: ElementType;
	connectorType: AssetConnectorType;
	model: ModelRef;
	config: ConnectorConfig;
};

export type GenerationNode = {
	id: NodeId;
	inputs: NodeInputs;
	/** Keyed by the label the declaring plugin gave the dependency, which is how its result reaches that plugin. */
	dependsOn: Record<string, GenerationNode>;
	job: GenerationJob;
};

/** The settings a build reads, so the live graph rebuilds when one changes. */
export const buildSettings = (state: ProjectData) =>
	pick(state, ["videoSettings", "scriptSettings"]);

export type BuildContext = {
	state: ReturnType<typeof buildSettings>;
	canvas: CanvasElement[];
	registry: ConnectorRegistry;
};

export function missingInput(node: GenerationNode): string | undefined {
	const { source } = ELEMENT_TYPES[node.job.elementType];
	if (source) return isEmpty(node.dependsOn) ? source : undefined;
	return node.inputs.prompt ? undefined : "Enter a prompt first";
}

export const isReady = (node: GenerationNode): boolean => !missingInput(node);

/** Every node reachable from `roots`, dependencies before their dependents. */
export function flattenGraph(roots: GenerationNode[]): GenerationNode[] {
	const ordered: GenerationNode[] = [];
	const seen = new Set<NodeId>();
	const visit = (node: GenerationNode) => {
		if (seen.has(node.id)) return;
		seen.add(node.id);
		for (const dep of Object.values(node.dependsOn)) visit(dep);
		ordered.push(node);
	};
	for (const root of roots) visit(root);
	return ordered;
}
