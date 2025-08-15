// export type NodeType = "NOTIFY" | "WAIT" | "EMAIL" | "IF" | "API_CALL";

// export interface WfNode { id: string; name: string; type: NodeType; config: any; }
// export interface WfEdge { id: string; source: string; target: string; predicate?: "then" | "else"; }

// export interface Workflow {
//     id: string;
//     name: string;
//     description?: string | null;
//     graph: { nodes: WfNode[]; edges: WfEdge[] };
//     triggerRule?: any | null;
//     createdAt?: string;
//     updatedAt?: string;
// }

// export type RunStatus = "PENDING" | "RUNNING" | "SUCCESS" | "FAILED";
// export interface Run {
//     id: string;
//     workflowId: string;
//     status: RunStatus;
//     input: any;
//     startedAt: string;
//     finishedAt?: string | null;
//     currentNodeId?: string | null;
// }

// export interface RunLog {
//     id: string;
//     runId: string;
//     nodeId?: string | null;
//     level: "INFO" | "WARN" | "ERROR";
//     message: string;
//     details?: any;
//     ts: string;
// }
// app/lib/types.ts
export type NodeType = string; // allow dynamic types

export type WfNode = {
    id: string;
    name: string;
    type: NodeType;
    config: any;
};

export type WfEdge = {
    id: string;
    source: string;
    target: string;
    predicate?: "then" | "else";
};

export type WorkflowGraph = {
    nodes: WfNode[];
    edges: WfEdge[];
};

export type Workflow = {
    id: string;
    name: string;
    description: string | null;
    graph: WorkflowGraph;
    triggerRule: any;
};

export type Run = {
    id: string;
    workflowId: string;
    status: "PENDING" | "RUNNING" | "SUCCESS" | "FAILED";
    input: any;
    startedAt: string | null;
    finishedAt: string | null;
    currentNodeId: string | null;
};

export interface RunLog {
    id: string;
    runId: string;
    nodeId?: string | null;
    level: "INFO" | "WARN" | "ERROR";
    message: string;
    details?: any;
    ts: string;
}

// Dynamic node catalog
export type ActionKind = {
    id: string;
    key: string;        // used as node.type
    name: string;       // label in palette
    executor: string;   // "HTTP" | "WAIT" | "IF" | ...
    schemaJson: any;    // JSON Schema for config
    uiSchemaJson?: any; // optional UI hints
    defaultsJson?: any; // default config for new instance
};
