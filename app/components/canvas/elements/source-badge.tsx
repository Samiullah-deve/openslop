"use client";

import { Badge } from "@/components/ui/badge";
import { isContentType } from "@/lib/canvas/guards";
import { ELEMENT_CONFIGS } from "./element-configs";
import { useElementGeneration } from "./element-generation-context";

/** The element above that a sourced element generates from. */
export function SourceBadge() {
	const { node } = useElementGeneration();
	const [source] = Object.values(node.dependsOn);
	const type = source?.job.elementType;
	if (!type || !isContentType(type)) return null;
	const { Icon, label } = ELEMENT_CONFIGS[type];
	return (
		<Badge size="attribute" title={`From the ${label.toLowerCase()} above`}>
			<Icon className="size-3 opacity-70" aria-hidden="true" />
			<span className="min-w-0 truncate">{label}</span>
		</Badge>
	);
}
