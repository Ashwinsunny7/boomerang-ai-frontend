export type NodeType = "NOTIFY" | "WAIT" | "EMAIL" | "IF" | "API_CALL";

export interface WfNode { id: string; name: string; type: NodeType; config: any; }
export interface WfEdge { id: string; source: string; target: string; predicate?: "then" | "else"; }

export interface Workflow {
    id: string;
    name: string;
    description?: string | null;
    graph: { nodes: WfNode[]; edges: WfEdge[] };
    triggerRule?: any | null;
    createdAt?: string;
    updatedAt?: string;
}

export type RunStatus = "PENDING" | "RUNNING" | "SUCCESS" | "FAILED";
export interface Run {
    id: string;
    workflowId: string;
    status: RunStatus;
    input: any;
    startedAt: string;
    finishedAt?: string | null;
    currentNodeId?: string | null;
}

export interface RunLog {
    id: string;
    runId: string;
    nodeId?: string | null;
    level: "INFO" | "WARN" | "ERROR";
    message: string;
    details?: any;
    ts: string;
}
