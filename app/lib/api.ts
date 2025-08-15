// app/lib/api.ts
import { API_BASE } from "../const";
import type { Workflow, Run, ActionKind, RunLog } from "./types";

const j = async <T>(r: Response): Promise<T> => {
    if (!r.ok) throw new Error(`HTTP_${r.status}`);
    return (await r.json()) as T;
};

export const Workflows = {
    list: (): Promise<Workflow[]> => fetch(`${API_BASE}/workflows`).then(j<Workflow[]>),
    get: (id: string): Promise<Workflow> => fetch(`${API_BASE}/workflows/${id}`).then(j<Workflow>),
    create: (wf: Workflow): Promise<Workflow> =>
        fetch(`${API_BASE}/workflows`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(wf),
        }).then(j<Workflow>),
    update: (id: string, wf: Workflow): Promise<Workflow> =>
        fetch(`${API_BASE}/workflows/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(wf),
        }).then(j<Workflow>),
    remove: (id: string): Promise<{ ok: true }> =>
        fetch(`${API_BASE}/workflows/${id}`, { method: "DELETE" }).then(j<{ ok: true }>)
};

export const Runs = {
    list: (workflowId?: string): Promise<Run[]> => {
        const qs = workflowId ? `?workflowId=${encodeURIComponent(workflowId)}` : "";
        return fetch(`${API_BASE}/runs${qs}`).then(j<Run[]>);
    },
    get: (runId: string): Promise<Run> => fetch(`${API_BASE}/runs/${runId}`).then(j<Run>),
    logs: (runId: string): Promise<RunLog[]> =>
        fetch(`${API_BASE}/runs/${runId}/logs`).then(j<RunLog[]>),
    start: (workflowId: string, input: any): Promise<string> =>
        fetch(`${API_BASE}/runs/${workflowId}/start`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ input }),
        }).then((r) => r.text()), // backend returns runId as plain text
};

export const Actions = {
    list: (): Promise<ActionKind[]> => fetch(`${API_BASE}/actions`).then(j<ActionKind[]>),
    create: (payload: Partial<ActionKind>): Promise<ActionKind> =>
        fetch(`${API_BASE}/actions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        }).then(j<ActionKind>),
};

export const Events = {
    ingestLead: (payload: any) =>
        fetch(`${API_BASE}/events/leads`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        }).then(res => j<{ triggered: string[] }>(res)),
};

