import { API_BASE } from "../const";
import type { Workflow, Run, RunLog } from "./types";

async function j<T>(res: Response): Promise<T> {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    // cast is safe when endpoints are known
    return res.json() as Promise<T>;
}

export const Workflows = {
    list: () => fetch(`${API_BASE}/workflows`).then(res => j<Workflow[]>(res)),
    get: (id: string) => fetch(`${API_BASE}/workflows/${id}`).then(res => j<Workflow>(res)),
    create: (wf: Workflow) =>
        fetch(`${API_BASE}/workflows`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(wf),
        }).then(res => j<Workflow>(res)),
    update: (id: string, wf: Partial<Workflow>) =>
        fetch(`${API_BASE}/workflows/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(wf),
        }).then(res => j<Workflow>(res)),
    remove: (id: string) =>
        fetch(`${API_BASE}/workflows/${id}`, { method: "DELETE" }).then(res => j<{ ok: true }>(res)),
};

export const Runs = {
    list: (workflowId?: string) => {
        const url = workflowId
            ? `${API_BASE}/runs?workflowId=${encodeURIComponent(workflowId)}`
            : `${API_BASE}/runs`;
        return fetch(url).then(res => j<Run[]>(res));
    },
    get: (id: string) => fetch(`${API_BASE}/runs/${id}`).then(res => j<Run>(res)),
    logs: (id: string) => fetch(`${API_BASE}/runs/${id}/logs`).then(res => j<RunLog[]>(res)),
    start: (workflowId: string, input: any) =>
        fetch(`${API_BASE}/runs/${workflowId}/start`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ input }),
        }).then(res => res.text()), // backend returns plain runId
};

export const Events = {
    ingestLead: (payload: any) =>
        fetch(`${API_BASE}/events/leads`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        }).then(res => j<{ triggered: string[] }>(res)),
};
