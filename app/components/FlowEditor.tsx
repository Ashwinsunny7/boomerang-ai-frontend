import React, { useCallback, useMemo, useState } from "react";
import ReactFlow, {
    addEdge, Background, Controls, MiniMap,
    useEdgesState, useNodesState,
    Handle, Position,            // 👈 add these
} from "reactflow";
// types
import type { Connection, Edge, Node, NodeTypes, NodeProps } from "reactflow";

import "reactflow/dist/style.css";

import type { Workflow, WfNode, WfEdge, NodeType } from "../lib/types";
import { NodeConfigForm, type NodeFormData } from "./NodeConfigForm";


type RFData = { label: string; wfType: NodeType; config: any };

function BaseNode({ data }: NodeProps<RFData>) {
    return (
        <div className="relative rounded-xl border bg-white shadow-sm px-3 py-2">
            {/* target (incoming) on the left */}
            <Handle
                type="target"
                position={Position.Left}
                className="!w-2 !h-2 bg-emerald-500 border-0"
            />
            <div className="text-[10px] uppercase tracking-wide text-neutral-500">{data.wfType}</div>
            <div className="font-medium">{data.label}</div>
            {/* source (outgoing) on the right */}
            <Handle
                type="source"
                position={Position.Right}
                className="!w-2 !h-2 bg-sky-500 border-0"
            />
        </div>
    );
}
const nodeTypes: NodeTypes = { base: BaseNode };

function toRF(workflow: Workflow) {
    const nodes: Node<RFData>[] = workflow.graph.nodes.map((n, i) => ({
        id: n.id,
        type: "base",
        position: { x: (i % 4) * 240, y: Math.floor(i / 4) * 160 },
        data: { label: n.name, wfType: n.type, config: n.config }
    }));
    const edges: Edge[] = workflow.graph.edges.map((e) => ({
        id: e.id, source: e.source, target: e.target, label: e.predicate, animated: !!e.predicate
    }));
    return { nodes, edges };
}
function fromRF(nodes: Node<RFData>[], edges: Edge[]): { nodes: WfNode[]; edges: WfEdge[] } {
    const n: WfNode[] = nodes.map(no => ({ id: no.id, name: no.data.label, type: no.data.wfType, config: no.data.config }));
    const e: WfEdge[] = edges.map(ed => ({ id: ed.id, source: ed.source, target: ed.target, predicate: (ed.label as any) || undefined }));
    return { nodes: n, edges: e };
}

const STARTER_NODE = (id: string, type: NodeType, name: string, config: any): Node<RFData> => ({
    id, type: "base", position: { x: 100, y: 100 }, data: { wfType: type, label: name, config }
});

export function FlowEditor(props: { value: Workflow; onChange: (wf: Workflow) => void; }) {
    const initial = useMemo(() => toRF(props.value), [props.value]);
    const [nodes, setNodes, onNodesChange] = useNodesState(initial.nodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initial.edges);
    const [selected, setSelected] = useState<Node<RFData> | null>(null);

    const onConnect = useCallback((c: Connection) => setEdges((eds) => addEdge({ ...c, id: crypto.randomUUID() }, eds)), []);
    const onNodeClick = (_: any, node: Node<RFData>) => setSelected(node);

    const addNode = (t: NodeType) => {
        const id = crypto.randomUUID();
        const defaults: Record<NodeType, any> = {
            NOTIFY: { msg: "Hello {{lead.name}}", channel: "console" },
            WAIT: { seconds: 3 },
            EMAIL: { to: "{{lead.email}}", subject: "Hi", body: "..." },
            IF: { rule: { "==": [{ "var": "lead.source" }, "LinkedIn"] } },
            API_CALL: { method: "POST", url: "https://httpbin.org/post", bodyTemplate: "{}" }
        };
        setNodes(ns => ns.concat(STARTER_NODE(id, t, `${t} node`, defaults[t])));
    };

    const saveNode = (val: NodeFormData) => {
        if (!selected) return;
        setNodes(ns => ns.map(n => n.id === selected.id ? { ...n, data: { ...n.data, label: val.name, config: val.config } } : n));
    };

    const setPredicate = (edgeId: string, pred: "then" | "else" | "") => {
        setEdges(eds => eds.map(e => e.id === edgeId ? { ...e, label: pred || undefined } : e));
    };

    const applyToWorkflow = () => {
        const graph = fromRF(nodes, edges);
        props.onChange({ ...props.value, graph });
    };

    return (
        <div className="grid grid-cols-[240px,1fr,320px] gap-4">
            <div>
                <div className="text-sm font-semibold mb-2">Node palette</div>
                {(["NOTIFY", "WAIT", "EMAIL", "IF", "API_CALL"] as NodeType[]).map(t => (
                    <button key={t} onClick={() => addNode(t)} className="w-full rounded border bg-white px-3 py-2 text-left hover:bg-neutral-50 mb-2">{t}</button>
                ))}
                <button onClick={applyToWorkflow} className="w-full rounded bg-black text-white px-3 py-2 mt-2">Apply to Workflow</button>
            </div>

            <div className="h-[70vh] rounded border bg-white">
                <ReactFlow
                    nodes={nodes} edges={edges}
                    onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
                    onConnect={onConnect} onNodeClick={onNodeClick}
                    nodeTypes={nodeTypes} fitView
                >
                    <MiniMap /><Controls /><Background />
                </ReactFlow>
            </div>

            <div>
                <div className="text-sm font-semibold mb-2">Inspector</div>
                {!selected && <div className="text-sm text-neutral-500">Select a node to edit</div>}
                {selected && (
                    <NodeConfigForm
                        type={selected.data.wfType}
                        initial={{ type: selected.data.wfType, name: selected.data.label, config: selected.data.config }}
                        onSubmit={saveNode}
                    />
                )}

                <div className="mt-6">
                    <div className="text-sm font-semibold mb-2">Edge predicates</div>
                    <ul className="space-y-2">
                        {edges.map(e => (
                            <li key={e.id} className="flex items-center gap-2">
                                <span className="text-xs w-32 truncate">{e.source} → {e.target}</span>
                                <select className="rounded border px-2 py-1 text-sm"
                                    value={(e.label as string) || ""} onChange={(ev) => setPredicate(e.id, (ev.target.value || "") as any)}>
                                    <option value="">(none)</option>
                                    <option value="then">then</option>
                                    <option value="else">else</option>
                                </select>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
