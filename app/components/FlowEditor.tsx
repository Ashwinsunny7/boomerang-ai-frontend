// app/components/FlowEditor.tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import ReactFlow, {
    addEdge, Background, Controls, MiniMap,
    useEdgesState, useNodesState,
    Handle, Position, ConnectionMode, // ⬅️ add these
} from "reactflow";
import type { Connection, Edge, Node, NodeTypes } from "reactflow";
import "reactflow/dist/style.css";

import type { Workflow, WfNode, WfEdge, NodeType, ActionKind } from "../lib/types";
import { NodeConfigForm, type NodeFormData } from "./NodeConfigForm";
import { Actions } from "../lib/api";

// Dynamic form for catalog nodes
import Form from "@rjsf/core";
import validator from "@rjsf/validator-ajv8";
import { TwForm } from "./TwForm";

type RFData = { label: string; wfType: NodeType; config: any };
// UI labels ↔ stored values
const PRED_UI_TO_VALUE = { yes: "then", no: "else" } as const;
const PRED_VALUE_TO_UI = { then: "yes", else: "no" } as const;

function isIfNode(node: Node<RFData> | undefined) {
    return node?.data?.wfType === "IF";
}


function BaseNode({ data }: { data: RFData }) {
    return (
        <div className="relative rounded-xl border bg-white shadow-sm px-3 py-2">
            {/* Target handle (incoming edges) */}
            <Handle
                type="target"
                position={Position.Left}
                className="!w-3 !h-3 !bg-blue-500 !border-0"
            />
            {/* Source handle (outgoing edges) */}
            <Handle
                type="source"
                position={Position.Right}
                className="!w-3 !h-3 !bg-blue-500 !border-0"
            />

            {/* Optional: uncomment if you want top/bottom connectors too */}
            {/* <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-blue-500 !border-0" />
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-blue-500 !border-0" /> */}

            <div className="text-[10px] uppercase tracking-wide text-neutral-500">{data.wfType}</div>
            <div className="font-medium">{data.label}</div>
        </div>
    );
}

const nodeTypes: NodeTypes = { base: BaseNode };

const STATIC_TYPES = new Set(["NOTIFY", "WAIT", "EMAIL", "IF", "API_CALL"]);

function toRF(workflow: Workflow) {
    const nodes: Node<RFData>[] = workflow.graph.nodes.map((n, i) => ({
        id: n.id,
        type: "base",
        position: { x: (i % 4) * 240, y: Math.floor(i / 4) * 160 },
        data: { label: n.name, wfType: n.type, config: n.config },
    }));
    const edges: Edge[] = workflow.graph.edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        label: e.predicate,
        animated: !!e.predicate,
    }));
    return { nodes, edges };
}

function fromRF(nodes: Node<RFData>[], edges: Edge[]): { nodes: WfNode[]; edges: WfEdge[] } {
    const n: WfNode[] = nodes.map((no) => ({
        id: no.id,
        name: no.data.label,
        type: no.data.wfType,
        config: no.data.config,
    }));
    const e: WfEdge[] = edges.map((ed) => ({
        id: ed.id,
        source: ed.source,
        target: ed.target,
        predicate: (ed.label as any) || undefined,
    }));
    return { nodes: n, edges: e };
}

const STARTER_NODE = (id: string, type: NodeType, name: string, config: any): Node<RFData> => ({
    id,
    type: "base",
    position: { x: 100, y: 100 },
    data: { wfType: type, label: name, config },
});

export function FlowEditor(props: { value: Workflow; onChange: (wf: Workflow) => void }) {
    const initial = useMemo(() => toRF(props.value), [props.value]);
    const [nodes, setNodes, onNodesChange] = useNodesState(initial.nodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initial.edges);
    const [selected, setSelected] = useState<Node<RFData> | null>(null);

    const [catalog, setCatalog] = useState<ActionKind[]>([]);
    useEffect(() => {
        Actions.list().then(setCatalog).catch(() => setCatalog([]));
    }, []);

    const byKey = useMemo(() => {
        const m = new Map<string, ActionKind>();
        catalog.forEach((a) => m.set(a.key, a));
        return m;
    }, [catalog]);

    const onConnect = useCallback(
        (c: Connection) => setEdges((eds) => addEdge({ ...c, id: crypto.randomUUID() }, eds)),
        []
    );
    const onNodeClick = (_: any, node: Node<RFData>) => setSelected(node);

    const addStaticNode = (t: NodeType) => {
        const id = crypto.randomUUID();
        const defaults: Record<string, any> = {
            NOTIFY: { msg: "Hello {{lead.name}}", channel: "console" },
            WAIT: { seconds: 3 },
            EMAIL: { to: "{{lead.email}}", subject: "Hi", body: "..." },
            IF: { rule: { "==": [{ var: "lead.source" }, "LinkedIn"] } },
            API_CALL: { method: "POST", url: "https://httpbin.org/post", bodyTemplate: "{}" },
        };
        setNodes((ns) => ns.concat(STARTER_NODE(id, t, `${t} node`, defaults[t] ?? {})));
    };

    const addCatalogNode = (a: ActionKind) => {
        const id = crypto.randomUUID();
        setNodes((ns) =>
            ns.concat(
                STARTER_NODE(id, a.key, a.name, a.defaultsJson ?? {})
            )
        );
    };

    const saveNode = (val: NodeFormData) => {
        if (!selected) return;
        setNodes((ns) =>
            ns.map((n) =>
                n.id === selected.id
                    ? { ...n, data: { ...n.data, label: val.name, config: val.config } }
                    : n
            )
        );
    };

    const nodesById = useMemo(() => {
        const m = new Map<string, Node<RFData>>();
        nodes.forEach(n => m.set(n.id, n));
        return m;
    }, [nodes]);


    const saveDynamicNode = (formData: any) => {
        if (!selected) return;
        setNodes((ns) =>
            ns.map((n) =>
                n.id === selected.id
                    ? { ...n, data: { ...n.data, config: formData } }
                    : n
            )
        );
    };

    const setPredicate = (edgeId: string, pred: "then" | "else" | "") => {
        setEdges((eds) =>
            eds.map((e) => (e.id === edgeId ? { ...e, label: pred || undefined } : e))
        );
    };
    function normalizeIfRules(nodes: Node<RFData>[]) {
        return nodes.map((n) => {
            if (n.data?.wfType === "IF") {
                const rule = n.data?.config?.rule;
                if (typeof rule === "string") {
                    try {
                        const parsed = JSON.parse(rule);
                        return { ...n, data: { ...n.data, config: { ...n.data.config, rule: parsed } } };
                    } catch {
                        // leave as-is; the form will show the error next time
                    }
                }
            }
            return n;
        });
    }
    const applyToWorkflow = () => {
        const normalizedNodes = normalizeIfRules(nodes);
        const graph = fromRF(normalizedNodes, edges);
        props.onChange({ ...props.value, graph });
    };
    // const applyToWorkflow = () => {
    //     const graph = fromRF(nodes, edges);
    //     props.onChange({ ...props.value, graph });
    // };

    const isStatic = (t: string) => STATIC_TYPES.has(t);
    const isDynamic = (t: string) => !isStatic(t) && byKey.has(t);

    return (
        <div className="grid grid-cols-[240px,1fr,320px] gap-4">
            {/* Left: palette */}
            <div>
                <div className="text-sm font-semibold mb-2">Node palette</div>
                {/* Static */}
                {Array.from(STATIC_TYPES).map((t) => (
                    <button
                        key={t}
                        onClick={() => addStaticNode(t)}
                        className="w-full rounded border bg-white px-3 py-2 text-left hover:bg-neutral-50 mb-2"
                    >
                        {t}
                    </button>
                ))}
                {/* Dynamic */}
                <div className="text-xs uppercase text-neutral-500 mt-3 mb-1">
                    Dynamic (Catalog)
                </div>
                {catalog.length === 0 && (
                    <div className="text-xs text-neutral-500 mb-2">
                        No catalog actions. Create one at <span className="font-mono">/actions/new</span>
                    </div>
                )}
                {catalog.map((a) => (
                    <button
                        key={a.key}
                        onClick={() => addCatalogNode(a)}
                        className="w-full rounded border bg-white px-3 py-2 text-left hover:bg-neutral-50 mb-2"
                    >
                        {a.name} <span className="text-[10px] text-neutral-500">({a.key})</span>
                    </button>
                ))}
                <button
                    onClick={applyToWorkflow}
                    className="w-full rounded bg-black text-white px-3 py-2 mt-2"
                >
                    Apply to Workflow
                </button>
            </div>

            {/* Center: canvas */}
            <div className="h-[70vh] rounded border bg-white">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onNodeClick={onNodeClick}
                    nodeTypes={nodeTypes}
                    fitView
                    connectionMode={ConnectionMode.Loose}
                >
                    <MiniMap />
                    <Controls />
                    <Background />
                </ReactFlow>
            </div>

            {/* Right: inspector */}
            <div>
                <div className="max-h-[70vh] overflow-auto pr-2">
                    <div className="text-sm font-semibold mb-2">Inspector</div>
                    {!selected && (
                        <div className="text-sm text-neutral-500">Select a node to edit</div>
                    )}

                    {/* Static types use your existing form */}
                    {selected && isStatic(selected.data.wfType) && (
                        <NodeConfigForm
                            type={selected.data.wfType}
                            initial={{
                                type: selected.data.wfType,
                                name: selected.data.label,
                                config: selected.data.config,
                            }}
                            onSubmit={saveNode}
                        />
                    )}

                    {/* Dynamic types use JSON-Schema form */}
                    {selected && isDynamic(selected.data.wfType) && (() => {
                        const a = byKey.get(selected.data.wfType)!;
                        return (
                            // <Form
                            //     validator={validator}
                            //     schema={a.schemaJson}
                            //     uiSchema={a.uiSchemaJson}
                            //     formData={selected.data.config}
                            //     onSubmit={(e) => saveDynamicNode(e.formData)}
                            // >
                            //     <button type="submit" className="rounded bg-black text-white px-3 py-2">
                            //         Save Node
                            //     </button>
                            // </Form>
                            <TwForm
                                schema={a.schemaJson}
                                uiSchema={a.uiSchemaJson}
                                formData={selected.data.config}
                                onSubmit={(e: any) => saveDynamicNode(e.formData)}
                            >
                                <button type="submit" className="rounded bg-black text-white px-3 py-2">
                                    Save Node
                                </button>
                            </TwForm>

                        );
                    })()}
                </div>

                {/* Predicates */}
                {/* <div className="mt-6">
                    <div className="text-sm font-semibold mb-2">Edge predicates</div>
                    <ul className="space-y-2">
                        {edges.map((e) => (
                            <li key={e.id} className="flex items-center gap-2">
                                <span className="text-xs w-32 truncate">
                                    {e.source} → {e.target}
                                </span>
                                <select
                                    className="rounded border px-2 py-1 text-sm"
                                    value={(e.label as string) || ""}
                                    onChange={(ev) =>
                                        setPredicate(e.id, (ev.target.value || "") as any)
                                    }
                                >
                                    <option value="">(none)</option>
                                    <option value="then">then</option>
                                    <option value="else">else</option>
                                </select>
                            </li>
                        ))}
                    </ul>
                </div> */}
                <div className="mt-6">
                    <div className="text-sm font-semibold mb-2">Decisions (Yes/No from IF nodes)</div>
                    <ul className="space-y-2">
                        {edges
                            .filter(e => isIfNode(nodesById.get(e.source))) // only IF edges
                            .map(e => {
                                const uiVal = (e.label && PRED_VALUE_TO_UI[e.label as "then" | "else"]) || "";
                                return (
                                    <li key={e.id} className="flex items-center gap-2">
                                        <span className="text-xs w-40 truncate">
                                            {e.source} (IF) → {e.target}
                                        </span>
                                        <select
                                            className="rounded border px-2 py-1 text-sm"
                                            value={uiVal}
                                            onChange={(ev) => {
                                                const v = ev.target.value as "" | "yes" | "no";
                                                setEdges(eds =>
                                                    eds.map(x =>
                                                        x.id === e.id
                                                            ? { ...x, label: v ? (PRED_UI_TO_VALUE[v] as any) : undefined }
                                                            : x
                                                    )
                                                );
                                            }}
                                        >
                                            <option value="">— choose —</option>
                                            <option value="yes">Yes (true)</option>
                                            <option value="no">No (false)</option>
                                        </select>
                                    </li>
                                );
                            })}
                    </ul>
                </div>

            </div>
        </div>
    );
}
